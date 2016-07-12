var default_state = {
	"active": "true"
};
var state = null;

function click(e) {
	state.active = !state.active;
	stateUpdated();
}

function stateUpdated() {
	document.getElementById("mode").innerText = state.active? "enabled": "disabled";
	document.getElementById("mode").className = state.active? "enabled": "disabled";
	chrome.storage.local.set({"state": state});
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById("mode").addEventListener('click', click);
  chrome.storage.local.get({'state': default_state}, function(result) { state = result["state"]; stateUpdated(); });
});
