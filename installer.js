function handleStateEvent(ev) {
    var obj = ev.detail;
    //console.log(obj);
    var s = obj.state;
    if (s == "writing") {
        //progress
        var i = obj.details.percentage;
        document.getElementById('state').textContent = "Writing...";
        document.getElementById('progress').textContent = i + "%";
        document.getElementById('extra').textContent = `${(obj.details.bytesWritten / 1000).toFixed(1)} / ${(obj.details.bytesTotal / 1000).toFixed(1)} kB`
            //bar
        var a = (i < 50) ? 1.0 : 1.0 - (i - 50) * 0.02;
        document.getElementById('bar-inner').style.transform = `translate(-${(100 - i) / 2}%,-10%)`
        document.getElementById('bar-inner').style.background = `linear-gradient(to right, rgba(255,255,255,${a}) 50%, #444 50%)`;
    } else {
        document.getElementById('state').textContent = obj.message;

        //env
        var manifestName = obj.manifest ? obj.manifest.name : "";
        var chipFamily = obj.chipFamily;
        var env = "";
        if (manifestName) {
            env = obj.manifest.name;
            if (chipFamily) env += " - "
        }
        if (chipFamily) env += obj.chipFamily;
        if (env == "") env = "&nbsp;";
        document.getElementById('env').innerHTML = env;

        //hide button and show log
        if (s == "initializing") {
            document.getElementsByClassName('inst-button')[0].style.display = "none";
            document.getElementsByClassName('log')[0].style.display = "block";
        } else if (s == "finished") {
            document.getElementById('reset-button').style.display = "block";
        } else if (s == "error") {
            document.getElementById('state').textContent = "Error!";
            document.getElementById('extra').textContent = obj.message;
            document.getElementById('reset-button').style.display = "block";
            if (!obj.chipFamily) document.getElementById('env').textContent = "";
        }
    }
}


function setManifest() {
    var sel = document.getElementById('board');
    var opt = sel.options[sel.selectedIndex];
    var name = opt.dataset.manifest;

    var flashsize = document.getElementById('size');
    opt = flashsize.options[flashsize.selectedIndex];

    var man = "./firmware/"
    man += name;
    man += "_";
    man += opt.value;
    man += "MB.json";

    var firmware = name;
    firmware += "_";
    firmware += opt.value;
    firmware += "MB.bin";

    document.getElementById('inst').setAttribute('manifest', man);
    document.getElementById('link').setAttribute('href', "./firmware/" + firmware);
    document.getElementById('link').setAttribute('download', firmware);
    // document.getElementById('verstr').textContent = opt.text;
}


function setModel() {
    try {
        var sel = document.getElementById('board');
        var opt = sel.options[sel.selectedIndex];
        var man = opt.dataset.manifest;
        var sizes = JSON.parse(opt.dataset.flashsize);
        var flashsize = document.getElementById('size');
        opt = flashsize.options[flashsize.selectedIndex];
        var selsize = opt.value;

        flashsize.options.length = 0;
        for (let i in sizes) {
            size = sizes[i];

            option = document.createElement('option');
            option.setAttribute('value', size);
            option.appendChild(document.createTextNode(size + " MB"));
            flashsize.appendChild(option);
            if (size == selsize) flashsize.value = size;
        }
        //flashsize.style.visibility = (flashsize.length > 1) ? 'visible' : 'hidden';

        setManifest();
    } catch (err) {
        console.log("setModel not loaded");
    }
}


function toggleErase() {
    if (document.getElementById('erase').checked) {
        document.getElementById('inst').setAttribute('erase-first', '');
    } else {
        document.getElementById('inst').removeAttribute('erase-first');
    }
}

function reset() {
    document.getElementById('bar-inner').style.transform = `translate(-50%,-10%)`
    document.getElementById('bar-inner').style.background = `linear-gradient(to right, rgba(255,255,255,1.0) 50%, #444 50%)`;
    document.getElementById('progress').textContent = "";
    document.getElementById('extra').textContent = "";
    document.getElementsByClassName('inst-button')[0].style.display = "block";
    document.getElementsByClassName('log')[0].style.display = "none";
    document.getElementById('reset-button').style.display = "none";
}


function unsupported() {
    // document.getElementById('flasher').innerHTML = "Sorry, your browser is not yet supported!<br>Please try on Desktop Chrome or Edge.<br>"
    document.getElementById('inst').style.display = "none";
    // document.getElementById('clean').style.display = "none";
    document.getElementById('support').style.display = "block";
}

function checkSupported() {
    const button = document.querySelector('esp-web-install-button');

    if (typeof(button) != 'undefined' && button != null) {
        if (button.hasAttribute('install-supported')) {
          console.log('The browser does support web installer');
      } else {
          unsupported();
          console.log('The browser does not support web installer');
        }
    } else {
        console.log('Web Install button not found');
    }
}

function showSerialHelp() {
    document.getElementById('coms').innerHTML = `Hit "Install" and select the correct COM port.<br><br>
You might be missing the drivers for your board.<br>
Here are drivers for chips commonly used in ESP boards:<br>
<a href="https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers" target="_blank">CP2102 (square chip)</a><br>
<a href="https://github.com/nodemcu/nodemcu-devkit/tree/master/Drivers" target="_blank">CH34x (rectangular chip)</a><br><br>
Make sure your USB cable supports data transfer.<br><br>
`;
}

function installerLoaded() {
    const espWebInstallButtonList = document.querySelectorAll("esp-web-install-button");
    espWebInstallButtonList.forEach(function(espWebInstallButton) {
        espWebInstallButton.addEventListener("state-changed", handleStateEvent);
    });
    checkSupported();
}