import { HttpStatus, MimeType } from '@toba/node-tools'
import { blog, owner } from '@trailimage/models'
import { Request, Response } from 'express'
import { config } from '../config'
import { Page, Layout, view } from '../views/'

function about(_req: Request, res: Response) {
   view.send(res, Page.About, {
      title: 'About ' + config.site.title,
      jsonLD: owner()
   })
}

/**
 * XML Sitemap.
 */
function siteMap(_req: Request, res: Response) {
   view.send(
      res,
      Page.Sitemap,
      {
         posts: blog.posts,
         layout: Layout.None,
         categories: blog.categoryKeys(),
         tags: blog.tags
      },
      MimeType.XML
   )
}

function issues(_req: Request, res: Response) {
   res.redirect(HttpStatus.PermanentRedirect, 'https://issues.' + config.domain)
}

export const staticPage = { issues, about, siteMap }
