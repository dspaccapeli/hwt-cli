#!/usr/bin/env node

'use strict';
// import base modules for cli
const meow = require('meow');
const importJsx = require('import-jsx');
const React = require('react');
const { render } = require('ink');
const Conf = require('conf');
// import additional libraries
const fetch = require('node-fetch');
const https = require('https');
// import jsx components
const help = importJsx('./help');
const init = importJsx('./init');
const exec = importJsx('./exec');

/*
** Setting up the configuration
*/
const cli = meow({
	flags: {
		help: {
			type: 'boolean',
			alias: 'h'
		},
		init: {
			type: 'boolean',
			alias: 'i'
		},
		exec: {
			type: 'boolean',
			alias: 'x',
			default: false
		},
		lang: {
			type: 'string',
			alias: 'l',
			default: 'sh'
		},
		version: {
			type: 'boolean',
			alias: 'v',
		},
		out: {
			type: 'boolean',
			alias: 'o',
		}
	},
	autoHelp: false,
	autoVersion: false,
	allowUnknownFlags: false,
});

/*
** Variable declarations
*/
const encryptionKey = "security through obscurity";
let missingConfig = false;
let flags = cli.flags;
// string, possible values: aix, darwin, freebsd, linux, openbsd, sunos, win32
let platform = process.platform;
// arguments:  [ '--help', 'difahfd' ]
let args = process.argv.slice(2);
let flagStart = [];
let prompt = [];
let flagInPrompt = false;

// getting`flags:  [ '--help', '--init', '--exec', '--lang', '--version', '--out' ]`
flags = Object.keys(flags).map((flag) => {
	return "--" + flag;
});

/*
** unused
** getting `shorthandFlags:  [ '-h', '-i', '-x', '-l', '-v', '-o' ]`
*/
let shorthandFlags = getUniqueProperties(cli.flags, cli.unnormalizedFlags);
shorthandFlags = Object.keys(shorthandFlags).map((flag) => {
	return "-" + flag;
});

/*
** Creating two arrays of arguments one up until strings that contain "-" or "--"
** the other one from the rest. e.g.,:
** >	flagStart:  [ '--help' ]
** >	prompt:  [ 'dhksahsjfka', '--something' ]
*/
let flagFound = false;
args.forEach((arg) => {
	if (!flagFound){
		if (arg.startsWith("-") || arg.startsWith("--")) {
			flagStart.push(arg);
		} else {
			flagFound = true;
			prompt.push(arg);
		}
	} else {
		if (arg.startsWith("-") || arg.startsWith("--")) {
			flagInPrompt = true;
		}
		prompt.push(arg);
	}
	
});
// reconstructing the prompt string from the array
prompt = prompt.join(" ");

/*
** Functions to start the specific UIs based on User Input
*/
const helpUI = async (missingConfig) => {
	let app;
	//change to help
	app = render(React.createElement(help, { missingConfig }));
	await app.waitUntilExit();
	process.exit();
}

const initUI = async (config) => {
	let app;
	//change to init
	app = render(React.createElement(init, { config }));
	await app.waitUntilExit();
	process.exit();
}

const execUI = async (apiKey, modelName, prompt, autoCopy, fastExec, directOut) => {
	let app;
	//change to init
	app = render(React.createElement(exec, {apiKey, modelName, prompt, autoCopy, fastExec, directOut }));
	await app.waitUntilExit();
	process.exit();
}

/*
** Configuration 
*/
const config = new Conf({
	projectName: cli.pkg.name,
	encryptionKey: encryptionKey,
});

// get the config values
let apiKey = config.get('apiKey') ? config.get('apiKey') : false;
let autoCopy = config.get('autoCopy') ? config.get('autoCopy') : false;
let modelName = config.get('modelName') ? config.get('modelName') : false;

// get the flags for fast execution and direct output
let fastExec = flagStart.some((flag) => flag.includes('-x') || flag.includes('--exec'));
let directOut = flagStart.some((flag) => flag.includes('-o') || flag.includes('--out'));

if (args.length == 1) {
	if (cli.flags.init) {
		initUI(config);
	} else if (cli.flags.version){
		console.log('hwt version ' + cli.pkg.version);
	} else if (cli.flags.help){
		if (apiKey === false || autoCopy === false) {
			missingConfig = true;
			helpUI(missingConfig);
		} else {
			helpUI(missingConfig);
		}
		
	} else {
		console.log('Command not recognized, try: hwt --help');
	}
} else if (args.length <= 1){
	if (apiKey === false || autoCopy === false || modelName === false) {
		missingConfig = true;
		helpUI(missingConfig);
	} else {
		helpUI(missingConfig);
	}
} else if(apiKey === false || autoCopy === false || modelName === false) {
	missingConfig = true;
	helpUI(missingConfig);
} else {
	/*
	** Main
	*/
	execUI(apiKey, modelName, prompt, autoCopy, fastExec, directOut);
}

function getUniqueProperties(obj1, obj2) {
	return Object.entries({...obj1, ...obj2})
	  .reduce((result, [key, value]) => {
		if (!obj1.hasOwnProperty(key) || !obj2.hasOwnProperty(key) || obj1[key] !== obj2[key]) {
		  result[key] = value;
		}
		return result;
	  }, {});
}
