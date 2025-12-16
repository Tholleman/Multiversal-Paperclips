import {getElement} from './view.mjs';

const themeOptions = ['system', 'light', 'dark'];
const themeSelector = getElement('#themeSelector');
const accentSelector = getElement('#accentSelector');

const systemMatcher = window.matchMedia('(prefers-color-scheme: dark)');
settings.theme.onChange(theme => {
	themeSelector.value = theme;
	switch (theme) {
		case 'system':
			matchSystem();
			systemMatcher.addEventListener('change', matchSystem);
			break;
		case 'light':
		case 'dark':
			systemMatcher.removeEventListener('change', matchSystem);
			document.body.classList.remove('dark', 'light');
			document.body.classList.add(theme);
	}
});
themeSelector.addEventListener('change', (event) => {
	const selected = event.target.value;
	if (!themeOptions.includes(selected)) return;
	settings.theme.value = selected;
});

settings.accent.onChange(accent => {
	if (!accentOptions.includes(accent)) return;
	accentSelector.value = accent;
	document.body.classList.remove(...accentOptions);
	document.body.classList.add(accent);
});
accentSelector.addEventListener('change', (event) => {
	const selected = event.target.value;
	if (!accentOptions.includes(selected)) return;
	settings.accent.value = selected;
})

function matchSystem() {
	if (systemMatcher.matches) {
		document.body.classList.remove('light');
		document.body.classList.add('dark');
	} else {
		document.body.classList.remove('dark');
		document.body.classList.add('light');
	}
}

export function saveSettings() {
	saveObject('settings', settings);
}
