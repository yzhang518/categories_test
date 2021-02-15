// initiate the page, display existing categories if the database is not empty
firstVisit();
console.log('I`m here. First visit.')

// set up submit button
document.addEventListener('DOMContentLoaded', bindButtons);
function bindButtons() {
	document.getElementById("catSubmit").addEventListener('click', function (event) {
		var req = new XMLHttpRequest();

		var payload = {
			catName: document.getElementById("catName").value,
			catDescription: document.getElementById("catDescription").value,
		};


		if (!payload.catName.length || !payload.catDescription.length) {
			alert("Required Fields cannot be Empty!");
			event.preventDefault();
			return;
		}

		var query = createQuery(payload);
		console.log("query", query);
		req.open("POST", "/insert" + query, true);
		//req.setRequestHeader('Content-Type', 'application/json');

		req.addEventListener('load', function () {
			if (req.status >= 200 && req.status < 400) {
				var response = JSON.parse(req.responseText);
				buildTable(response.results);
			} else {
				alert("error" + req.statusText);
			}
		});

		req.send();
		event.preventDefault();
	});
}

function firstVisit() {
	var req = new XMLHttpRequest();
	req.open("GET", "/return-data", true);

	req.addEventListener('load', function () {
		if (req.status >= 200 && req.status < 400) {
			var response = JSON.parse(req.responseText);
			buildTable(response.results);
		}
	});
	req.send();
}

function buildTable(data) {
	cleanUp();
	console.log('I`m here. Build table.')

	var div, headers, myTable, header, cell, keys, key, btnKeys, eventBtns;
	div = document.getElementById("catTable")
	headers = ["Category Name", "Category Description"];
	keys = ["catName", "catDescription"]
	btnKeys = ["edit"];

	myTable = document.createElement("table");
	headRow = document.createElement("tr");

	// display header row
	for (var i = 0; i < headers.length; i++) {
		cell = document.createElement("th");
		cell.innerHTML = headers[i];
		headRow.appendChild(cell);
	}
	myTable.appendChild(headRow);

	if (data == null) {
		return;
	}

	// add data rows to the table 
	data.forEach(addRows);
	function addRows(item) {
		var row = document.createElement("tr");
		// add data info
		for (var i = 0; i < headers.length; i++) {
			cell = document.createElement("td");
			key = keys[i];
			cell.innerHTML = item[key];
			row.appendChild(cell);
		}

		// add edit and delete button
		for (var j = 0; j < btnKeys.length; j++) {
			cell = document.createElement("td");
			var a_form = document.createElement("form");
			var input = document.createElement("input");
			var btn = document.createElement("input");

			input.type = "hidden"
			input.value = item.catID;

			btn.setAttribute("class", btnKeys[j]);
			btn.type = "button";
			btn.value = btnKeys[j].toUpperCase();
			btn.id = btnKeys[j] + String(item.catID);

			a_form.appendChild(btn);
			a_form.appendChild(input);
			cell.appendChild(a_form);
			row.appendChild(cell);
		}

		myTable.appendChild(row);
	}

	div.appendChild(myTable);

	eventBtns = document.getElementsByClassName("edit");
	for (var k = 0; k < eventBtns.length; k++) {
		var n = eventBtns[k].nextSibling.value;
		attach_edit(n, eventBtns[k]);
	}
}

// for using iteration to add edit eventlisteners
function attach_edit(id, btn) {
	btn.onclick = function () {
		editRow(id);
	}
}

function editRow(id) {
	updateContent(id);
	var updateID = "update" + String(id);

	document.getElementById(updateID).addEventListener("click", function () {

		var req = new XMLHttpRequest();
		var payload = {
			catName: document.getElementById("newName").value,
			catDescription: document.getElementById("newDescription").value,
		};

		payload.catID = id;

		if (!payload.catName.length || !payload.catDescription.length) {
			alert("Required Fields cannot be Empty!");
			event.preventDefault();
			return;
		}

		req.open("POST", "/update", true);
		req.setRequestHeader('Content-Type', 'application/json');

		req.addEventListener('load', function () {
			if (req.status >= 200 && req.status < 400) {
				var reponse = JSON.parse(req.responseText)
				buildTable(reponse);
			}
			else {
				console.log("Error in network request: " + req.statusText);
			}
		});

		req.send(JSON.stringify(payload));
		event.preventDefault();
	});
}


function updateContent(id) {
	// setup update button
	var btnId = "edit" + String(id);
	var curForm = document.getElementById(btnId).parentElement;
	var updateBtn = document.createElement("input");
	updateBtn.type = "button";
	updateBtn.id = "update" + String(id);
	updateBtn.value = "UPDATE";
	curForm.appendChild(updateBtn);
	document.getElementById(btnId).type = "hidden";

	var headers = ["Name", "Description"];
	//console.log(id);
	var curRow = document.getElementById(btnId).parentElement.parentElement.parentElement;
	var curCell = curRow.firstChild;
	var newInput;
	for (var i = 0; i < 2; i++) {
		newInput = document.createElement("input");
		newInput.value = curCell.innerHTML;


		curCell.innerHTML = null;
		newInput.id = "new" + headers[i];
		curCell.appendChild(newInput);

		curCell = curCell.nextSibling;
	}
}

function createQuery(payload) {
	var keys = ['catName', 'catDescription']
	var a_query = "?";
	keys.forEach(function (key) {
		var ele = payload[key];
		if (ele != null) {
			a_query += key + "=" + ele + "&";
		}
	});
	return a_query;
};

function cleanUp() {
	console.log('I`m here. Clean up.')

	var ids = ["catName", "catDescription"];
	ids.forEach(myFunc);
	function myFunc(id) {
		document.getElementById(id).value = null;
	}

	var myDiv = document.getElementById("catTable");
	if (myDiv.firstChild != null) {
		myDiv.removeChild(myDiv.firstChild);
	}
}


