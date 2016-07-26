document.addEventListener('DOMContentLoaded', function() {
	document.getElementById('expand').addEventListener('click', function() {
		var nav = document.getElementById('navigation')
		if (nav.className === '') {
			nav.className = 'visible'
		} else {
			nav.className = ''
		}
	})
})