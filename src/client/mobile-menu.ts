/// <reference types="jquery" />
/// <reference path="../types/jquery/index.d.ts"/>
/// <reference path="./browser.d.ts"/>
/// <reference path="./util.ts"/>

$(function() {
   const $button = $('#mobile-menu-button')
   const $menu = $('#mobile-menu')
   const $body = $('body')

   let prepared = false
   let visible = false

   const close = () => {
      $menu.hide(0, () => {
         visible = false
         $body.css({ position: 'static' })
      })
   }

   $button.click(() => {
      if (visible) {
         close()
      } else {
         $body.css({ position: 'fixed' })
         $menu.show(0, prepare)
      }
   })

   /**
    * Wire menu events
    */
   function prepare() {
      visible = true
      if (prepared) return

      $menu.find('.close').click(close)

      $menu.find('.menu-categories').on('change', 'select', e => {
         close()
         window.location.assign($(e.target).val() as string)
      })

      prepared = true
   }
})
