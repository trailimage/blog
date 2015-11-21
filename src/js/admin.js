'use strict';

$(function() {
	handlePost($('#views'));
	handlePost($('#models'));

	function handlePost($form) {
		$form.submit(function() {
			var disable = 'select, button';
			var $checkbox = $form.find('input[type=checkbox]');
			var data = {
				selected: $form.find('select').val(),
				checked: $checkbox.length > 0 ? $checkbox.checked : false
			};

			$form.find(disable).prop('disabled', true);
			$form.css('cursor', 'wait');
			$form.find('.message').hide();

			$.post($form.attr('action'), data, function(response) {
				$form.find(disable).prop('disabled', false);
				$form.css('cursor', 'auto');

				if (response.success) {
					var msg = response.message;
					window.alert((msg != "") ? 'Success:\n' + msg.replace(/,/g, '\n') : 'No new data found');
				} else {
					$form.find('.message').html('Failed').show();
				}
			});
			return false;
		});
	}
});
