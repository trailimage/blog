import { Blog } from '../types/';
import { is } from '@toba/utility';
import log from '../logger';
import config from '../config';
import util from '../util/';
import cache from '../cache';
import { httpStatus } from '../constants';
import fetch from 'node-fetch';

const cacheKey = 'spam-referer';
/**
 * Last time in milliseconds that black list was downloaded
 */
let lastUpdate = 0;
let blackList: string[] = [];
/**
 * Pending black list lookup callbacks
 */
let pending: Function[] = [];
let isDownloading = false;

/**
 * Return 404 for known spam referers
 *
 * https://en.wikipedia.org/wiki/Referer_spam
 */
export function blockSpamReferers(
   req: Blog.Request,
   res: Blog.Response,
   next: Function
) {
   const referer = req.get('referer');

   if (is.value(referer)) {
      checkSpammerList(util.topDomain(referer)).then(spam => {
         if (spam) {
            log.warnIcon('fingerprint', 'Spam blocked %s referer', referer);
            res.status(httpStatus.NOT_FOUND).end();
         } else {
            next();
         }
      });
   } else {
      next();
   }
}

/**
 * Whether requestor domain matches a spam referer
 */
function checkSpammerList(domain: string): Promise<boolean> {
   if (blackList.length === 0) {
      return getSpammerList().then(list => {
         blackList = list;
         return blackList.indexOf(domain) !== -1;
      });
   } else {
      if (isStale()) {
         downloadSpammerList();
      }
      return Promise.resolve(blackList.indexOf(domain) !== -1);
   }
}

/**
 * Load spammer list from cache or remote provider
 */
function getSpammerList(): Promise<string[]> {
   return cache.getItem<string[]>(cacheKey).then(list => {
      if (is.array(list)) {
         if (isStale()) {
            downloadSpammerList();
         }
         return list;
      } else {
         return downloadSpammerList();
      }
   });
}

/**
 * Whether spam list needs to be refreshed
 */
const isStale = () =>
   lastUpdate === 0 ||
   (config.referralSpam.updateFrequency > 0 &&
      new Date().getTime() - lastUpdate > config.referralSpam.updateFrequency);

function downloadSpammerList(): Promise<string[]> {
   if (isDownloading) {
      log.info('Spam referral black list is already downloading');
      return new Promise(resolve => {
         pending.push(resolve);
      });
   } else {
      isDownloading = true;
      log.infoIcon('cloud_download', 'Downloading spam referral black list');

      return fetch(config.referralSpam.listUrl)
         .then(res => {
            if (res.status != httpStatus.OK) {
               log.error(
                  '%s returned status %s',
                  config.referralSpam.listUrl,
                  res.status
               );
               return null;
            } else {
               return res.text();
            }
         })
         .then(body => {
            let list: string[] = [];

            if (is.value(body)) {
               // list of non-empty lines
               list = body.split('\n').filter(i => !is.empty(i));
               lastUpdate = new Date().getTime();
            }
            isDownloading = false;

            if (is.array(list) && list.length > 0) {
               // execute pending callbacks
               for (const c of pending) {
                  c(list);
               }
               pending = [];
               log.infoIcon(
                  'block',
                  'Downloaded %d blocked domains',
                  list.length
               );
               cache.add(cacheKey, list);
               return list;
            } else {
               return [];
            }
         })
         .catch(err => {
            log.error(
               'Failed to download referer blacklist: %s',
               err.toString()
            );
         }) as Promise<string[]>;
   }
}
