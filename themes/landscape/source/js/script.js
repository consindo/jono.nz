document.addEventListener('DOMContentLoaded', function() {
	var nav = document.getElementById('navigation')
	document.getElementById('expand').addEventListener('click', function() {
		if (nav.className === '') {
			nav.className = 'visible'
		} else {
			nav.className = ''
		}
	})
	document.querySelectorAll('#navigation li').forEach(function(item) {
		item.addEventListener('click', function() {
			nav.className = ''
		})
	})
})