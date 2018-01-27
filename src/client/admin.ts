/// <reference types="jquery" />
/// <reference path="../types/jquery/index.d.ts"/>
/// <reference path="./browser.d.ts"/>
/// <reference path="./util.ts"/>

/**
 * Manage cache items
 */
$(function() {
   handlePost($('#json'));
   handlePost($('#library'));
   handlePost($('#views'));
   handlePost($('#maps'));

   /**
    * Handle form post for particular cache section
    */
   function handlePost($form: JQuery) {
      $form.submit(() => {
         /** Selectors to disable while posting */
         const disable = 'select, button';

         /** List of cache items in current section */
         const $select = $form.find('select');

         /**
          * Checkbox to indicate whether related items should also be removed
          * from the cache
          */
         const $includeRelated = $form.find('input[name=include-related]');

         /** Whether to remove keys from select list */
         const remove =
            $form.find('input[name=remove-matches]').val() == 'true';

         const fields = {
            selected: $select.val() as string,
            includeRelated:
               $includeRelated.length > 0 && $includeRelated.is(':checked')
         };

         $form.find(disable).prop('disabled', true);
         $form.css('cursor', 'wait');
         $form.find('.message').hide();

         $.post($form.attr('action'), fields, (response: JsonResponse) => {
            $form.find(disable).prop('disabled', false);
            $form.css('cursor', 'auto');

            if (response.success) {
               const keys = response.message.split(',');
               if (remove) {
                  for (let i = 0; i < keys.length; i++) {
                     $select.find('option[value="' + keys[i] + '"]').remove();
                  }
               }
               window.alert(
                  keys.length > 0 && keys[0] != ''
                     ? 'Keys Affected:\n' + keys.join('\n')
                     : 'No new data found'
               );
            } else {
               $form
                  .find('.message')
                  .html('Failed')
                  .show();
            }
         });
         return false;
      });
   }
});
