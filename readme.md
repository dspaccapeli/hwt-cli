<pre>      ___           ___           ___     
     /\__\         /\__\         /\  \    
    /:/  /        /:/ _/_        \:\  \   
   /:/__/        /:/ /\__\        \:\  \  
  /::\  \ ___   /:/ /:/ _/_       /::\  \ 
 /:/\:\  /\__\ /:/_/:/ /\__\     /:/\:\__\
 \/__\:\/:/  / \:\/:/ /:/  /    /:/  \/__/
      \::/  /   \::/_/:/  /    /:/  /     
      /:/  /     \:\/:/  /     \/__/      
     /:/  /       \::/  /                 
     \/__/         \/__/  </pre> 

## hwt is the open-source terminal application to rule them all.

[![npm version](https://badge.fury.io/js/@spcpl%2Fhwt.svg)](https://badge.fury.io/js/@spcpl%2Fhwt)

Finding hard to remember all these pesky commands and flags for your CLI applications? Use hwt to use them with natural language.

### Example usage, in your terminal:

```
$ hwt print the path of the current directory

+----------------------+                | Press Enter to execute the command.
| Commands to execute: |                | Move between commands ⬆, ⬇ .
+----------------------+                | Press Esc/C-c to exit the program.
1.   pwd

// or you could ask

$ hwt list all the running docker containers

// or ...

$ hwt update python
```

It's an open-source alternative to [Github Copilot X CLI](https://githubnext.com/projects/copilot-cli). 

**You need an OpenAI API key to get started.**

### Install:

```
// To use hwt, you need to have Node and NPM installed

$ npm install -g @spcpl/hwt

// After that, you need to initialize it with your OpenAI API key.

$ hwt --init
```
