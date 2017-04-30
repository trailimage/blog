/// <reference types="jquery" />

'use strict';

$(function() {
   handlePost($('#json'));
   handlePost($('#library'));
   handlePost($('#views'));
   handlePost($('#maps'));

   function handlePost($form:JQuery) {
      $form.submit(function() {
         const disable = 'select, button';
         const $select = $form.find('select');
         const $includeRelated = $form.find('input[name=include-related]');
         // whether to remove keys from select list
         const remove = $form.find('input[name=remove-matches]').val() == 'true';
         const fields = {
            selected: $select.val(),
            includeRelated: $includeRelated.length > 0 && $includeRelated.is(':checked')
         };
         $form.find(disable).prop('disabled', true);
         $form.css('cursor', 'wait');
         $form.find('.message').hide();

         $.post($form.attr('action'), fields, function(response) {
            $form.find(disable).prop('disabled', false);
            $form.css('cursor', 'auto');

            if (response.success) {
               const keys = response.message.split(',');
               if (remove) {
                  for (let i = 0; i < keys.length; i++) {
                     $select.find('option[value="' + keys[i] + '"]').remove();
                  }
               }
               window.alert((keys.length > 0 && keys[0] != '')
                  ? 'Keys Affected:\n' + keys.join('\n')
                  : 'No new data found');
            } else {
               $form.find('.message').html('Failed').show();
            }
         });
         return false;
      });
   }
});