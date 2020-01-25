import { blog } from '@trailimage/models'
import { Request, Response } from 'express'
import { Page, Layout, view } from '../views/'

export function mobile(_req: Request, res: Response) {
   view.send(res, Page.MobileMenu, { blog, layout: Layout.None })
}

export const menu = { mobile }
