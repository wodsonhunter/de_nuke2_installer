const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron')
const path = require("path")
const fs = require('fs-extra');

const paths = {
	modsSource: path.join(__dirname, "minecraftFiles/mods"),
	icon: path.join(__dirname, "static/icon.png"),
	preload: path.join(__dirname, "Preload.js"),
	versionSource: path.join(__dirname, "minecraftFiles/version"),
	profileSource: path.join(__dirname, "minecraftFiles/profile.json"),
}

const createWindow = () => {
	const win = new BrowserWindow({
		width: 480,
		height: 270,
		resizable: false,
		icon: paths.icon,
		//frame: false,
		webPreferences: {
			preload: paths.preload
		}
	})

	win.loadFile('index.html')
	if (!app.isPackaged) win.webContents.openDevTools()
}


app.whenReady().then(() => {
	createWindow()

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().lenght === 0) createWindow()
	})
})

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit()
})

app.on("browser-window-created", (e, win) => {
	win.removeMenu()
})

ipcMain.on("install", (event, installPath) => {
	console.log(`installing mods in ${installPath}` )

	copyMods(installPath)
	copyVersion(installPath)
	installProfile(installPath)
})

ipcMain.handle("searchDir", async (event, currentPath) => {
	console.log("searching directory")
	win = BrowserWindow.getFocusedWindow()
	var result;
	await dialog.showOpenDialog(win, {
		properties: ['openDirectory'],
		defaultPath: currentPath
	  }).then(res => {
		result = res
	}).catch(err => {
		console.log(err)
	})
	return [result.canceled, result.filePaths]
})

ipcMain.on("redirectToTwitch", (event, args) => {
	console.log("redirecting to twitch")
	shell.openExternal('https://www.twitch.tv/chainavt')
})

function copyMods(installPath){
	var modsDestinyPath = path.join(installPath, "mods")
	var mods = getFileNames(paths.modsSource)
	console.log(mods)

	mods.forEach(element => {
		var mod = path.join(paths.modsSource, element)
		copy(mod, modsDestinyPath)
	});
}

function copyVersion(installPath){
	let versionDestinyPath = path.join(installPath, "versions")
	let version = getFileNames(paths.versionSource)[0]
	copy(path.join(paths.versionSource, version), versionDestinyPath)
}

function installProfile(installPath){
	let profileDestinyPath = path.join(installPath, "launcher_profiles.json");

	let sourceRawdata = fs.readFileSync(paths.profileSource);
	let sourceProfile = JSON.parse(sourceRawdata);

	let destinyRawdata = fs.readFileSync(profileDestinyPath);
	let destinyProfile = JSON.parse(destinyRawdata);
	
	destinyProfile["profiles"][Object.keys(sourceProfile)[0]] = sourceProfile[Object.keys(sourceProfile)[0]]

	destinyRawdata = JSON.stringify(destinyProfile, null, "\t");
	fs.writeFileSync(profileDestinyPath, destinyRawdata);
}

function getFileNames(filePath){
	var modNames = fs.readdirSync(filePath)
	return modNames
}

function copy(file, destination){
	fs.copy(file, path.join(destination, path.basename(file)), (err) => {if (err) throw err;});
}
