import { config as modelConfig, DataProvider } from '@trailimage/models'
import { Response, Request } from 'express'
import { is } from '@toba/node-tools'
import { Page, Layout, view } from '../views/'

/**
 * Redirect to authorization URL for unauthorized providers.
 */
export function main(_req: Request, res: Response) {
   ;[
      modelConfig.providers.post,
      modelConfig.providers.map,
      modelConfig.providers.video
   ].forEach(async p => {
      if (is.value<DataProvider<any>>(p) && !p.isAuthenticated) {
         const url = await p.authorizationURL()
         res.redirect(url)
         return
      }
   })
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
      title: 'Flickr Access',
      token: token.access,
      secret: token.secret,
      layout: Layout.NONE
   })
}

export const auth = { map: mapAuth, post: postAuth, main }
