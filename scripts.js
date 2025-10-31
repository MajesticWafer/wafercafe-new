// First-visit header drop-in animation controller
(function(){
	var header = document.querySelector('header');
	if (!header) return;

	requestAnimationFrame(function(){
		setTimeout(function(){
			header.classList.add('pop-up');
			// start pop-up animation

			var logo = header.querySelector('.logo');
			var icons = header.querySelectorAll('.icon-links a');
			if (logo) {
				logo.classList.add('child-appear');
				logo.style.animationDelay = '420ms';
			}
			icons.forEach(function(a, i){
				a.classList.add('icon-pop');
				a.style.animationDelay = (520 + i * 80) + 'ms';
			});
		}, 40);
	});
})();

// Fullscreen toggle: prefer player container when modal is open
(function(){
	var btn = document.getElementById('fullscreen-toggle');
	if (!btn) return;

	function isFullscreen() {
		return document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
	}

	function updateIcon() {
		var icon = btn.querySelector('i');
		if (!icon) return;
		if (isFullscreen()) {
			icon.className = 'bi bi-fullscreen-exit';
		} else {
			icon.className = 'bi bi-fullscreen';
		}
	}

	function requestFullscreenFor(el) {
		if (!el) return;
		if (el.requestFullscreen) el.requestFullscreen();
		else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
		else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
		else if (el.msRequestFullscreen) el.msRequestFullscreen();
	}

	function exitFullscreen() {
		if (document.exitFullscreen) document.exitFullscreen();
		else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
		else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
		else if (document.msExitFullscreen) document.msExitFullscreen();
	}

	btn.addEventListener('click', function(){
		var modal = document.getElementById('swf-modal');
		var player = document.getElementById('player-container');
		var target = (modal && modal.getAttribute('aria-hidden') === 'false' && player) ? player : document.documentElement;

		if (isFullscreen()) exitFullscreen();
		else requestFullscreenFor(target);
	});

	document.addEventListener('fullscreenchange', updateIcon);
	document.addEventListener('webkitfullscreenchange', updateIcon);
	document.addEventListener('mozfullscreenchange', updateIcon);
	document.addEventListener('msfullscreenchange', updateIcon);
	updateIcon();
})();

// Ruffle integration: initialize and control modal player
(function(){
	// Wait until Ruffle is available (loaded via CDN in index.html)
	function initRuffle() {
		if (!window.RufflePlayer && !window.Ruffle) return false;

		// Create a Ruffle instance factory
		var ruffle = window.RufflePlayer ? window.RufflePlayer.newest() : window.Ruffle;

		var modal = document.getElementById('swf-modal');
		var playerContainer = document.getElementById('player-container');

		function closeModal() {
			if (!modal) return;
			modal.setAttribute('aria-hidden', 'true');
			// remove existing player
			playerContainer.innerHTML = '';
		}

		function openModal(swfPath) {
			if (!modal) return;
			modal.setAttribute('aria-hidden', 'false');
			playerContainer.innerHTML = '';
			var el = document.createElement('div');
			el.style.width = '100%';
			el.style.height = '100%';
			playerContainer.appendChild(el);

			try {
				var player = ruffle.createPlayer();
				player.style.width = '100%';
				player.style.height = '100%';
				el.appendChild(player);
				player.load(swfPath);
			} catch (e) {
				playerContainer.innerHTML = '<div style="color:#fff;padding:16px">Failed to load SWF.</div>';
				console.error('Ruffle error', e);
			}
		}

		// Attach click handlers to buttons
		document.querySelectorAll('.game-btn[data-swf]').forEach(function(btn){
			btn.addEventListener('click', function(ev){
				ev.preventDefault();
				var swf = btn.getAttribute('data-swf');
				if (swf) openModal(swf);
			});
		});

		// close controls
		document.querySelectorAll('[data-close]').forEach(function(el){
			el.addEventListener('click', function(){ closeModal(); });
		});

		// close on escape
		document.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeModal(); });

		return true;
	}

	// Poll for Ruffle availability for a short time
	var attempts = 0;
	var ready = setInterval(function(){
		attempts++;
		if (initRuffle() || attempts > 40) clearInterval(ready);
	}, 100);
})();

// Theme toggle: remember user preference and switch html class
(function(){
	var toggle = document.getElementById('theme-toggle');
	var iconForLight = 'bi bi-sun';
	var iconForDark = 'bi bi-moon';

	function applyTheme(theme){
		if (theme === 'light') {
			document.documentElement.classList.add('light');
			if (toggle) toggle.innerHTML = '<i class="' + iconForLight + '"></i>';
		} else {
			document.documentElement.classList.remove('light');
			if (toggle) toggle.innerHTML = '<i class="' + iconForDark + '"></i>';
		}
	}

	try {
		var stored = localStorage.getItem('wafercafe_theme');
		applyTheme(stored === 'light' ? 'light' : 'dark');
	} catch (e) { applyTheme('dark'); }

	if (!toggle) return;
	toggle.addEventListener('click', function(){
		var isLight = document.documentElement.classList.toggle('light');
		try { localStorage.setItem('wafercafe_theme', isLight ? 'light' : 'dark'); } catch(e){}
		applyTheme(isLight ? 'light' : 'dark');
		toggle.classList.add('animate');
		toggle.addEventListener('animationend', function _onAnim(){
			toggle.classList.remove('animate');
			toggle.removeEventListener('animationend', _onAnim);
		});
	});
})();
