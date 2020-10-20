import { config as modelConfig, DataProvider } from '@trailimage/models'
import { Response, Request } from 'express'
import { is } from '@toba/node-tools'
import { Page, Layout, view } from '../views/'

/**
 * Redirect to authorization URL for unauthorized providers.
 */
export async function main(_req: Request, res: Response) {
   try {
      const urls = await Promise.all(
         [
            modelConfig.providers.post,
            modelConfig.providers.map,
            modelConfig.providers.video
         ]
            .filter(p => is.value<DataProvider<any>>(p) && !p.isAuthenticated)
            .map(p => p!.authorizationURL())
      )
      res.render(Page.Authorize, {
         title: 'Provider Login Links',
         urls,
         layout: Layout.NONE
      })
   } catch (e) {
      view.internalError(res, e)
   }
}

export function postAuth(req: Request, res: Response) {
   authCallback(modelConfig.providers.post, req, res)
}

export function mapAuth(req: Request, res: Response) {
   authCallback(modelConfig.providers.map, req, res)
}

/**
 * Handle provider authorization callback. Parameters can be unique per provider
 * so hand-off full request to the provider for parsing.
 */
async function authCallback(
   p: DataProvider<any> | undefined,
   req: Request,
   res: Response
) {
   if (p === undefined) {
      return view.internalError(
         res,
         new ReferenceError('No data provider supplied for authorization')
      )
   }
   const token = await p.getAccessToken(req)
   res.render(Page.Authorize, {
      title: 'Provider Access',
      token: token.access,
      secret: token.secret,
      layout: Layout.NONE
   })
}

export const auth = { map: mapAuth, post: postAuth, main }
