'use strict';

$(function() {
	handlePost($('#views'));
	handlePost($('#models'));
	handlePost($('#maps'));

	function handlePost($form) {
		$form.submit(function() {
			var disable = 'select, button';
			var $select = $form.find('select');
			var remove = $form.find('input[name=remove-matches]').val() == 'true';

			$form.find(disable).prop('disabled', true);
			$form.css('cursor', 'wait');
			$form.find('.message').hide();

			$.post($form.attr('action'), { selected: $select.val() }, function(response) {
				$form.find(disable).prop('disabled', false);
				$form.css('cursor', 'auto');

				if (response.success) {
					var slugs = response.message.split(',');
					if (remove) {
						for (var i = 0; i < slugs.length; i++) {
							$select.find('option[value="' + slugs[i] + '"]').remove();
						}
					}
					window.alert((slugs.length > 0 && slugs[0] != "")
						? 'Success:\n' + slugs.join('\n')
						: 'No new data found');
				} else {
					$form.find('.message').html('Failed').show();
				}
			});
			return false;
		});
	}
});
