const { remote } = require('electron');
// const { Buffer } = require('buffer');
let currWindow = remote.BrowserWindow.getFocusedWindow();
console.log("==============")
window.closeCurrentWindow = function(){
    currWindow.close();
}