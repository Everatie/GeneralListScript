//Global variables settings
dbType = false //  Entry type
hiddenList = ["hiddenGenre", "hiddenCountry", "hiddenYear", "hiddenScore", "hiddenTitle", "hiddenLi", "hiddenTitle"] // List of all types of hidden rows

//Database handling scripts
function dbExtract(url, dbFormat) {
    dbType = dbFormat

    fetch(url)
        .then(function (response) {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }

            return response.json();
        })
        .then(function (data) {
            formatPage(data);
        });
}

function formatPage(data) {
    for (let i = 0; i < data.List.length; i++) {
        // Create list item for each entry
        const sectionName = Object.keys(data.List[i]);

        const section_il = document.createElement('li');
        section_il.id = `section${sectionName}`;

        document.getElementById("table_list").append(section_il);

        // Add title
        const sectionTitle = document.createElement('h2');
        sectionTitle.innerHTML = Object.keys(data.List[i]);

        document.getElementById(section_il.id).append(sectionTitle);

        //Add table
        const section_table = document.createElement('table');
        section_table.id = `table_${sectionName}`;

        document.getElementById(section_il.id).appendChild(section_table);

        // Fill table
        fillTable(section_table, data.List[i][Object.keys(data.List[i])]);
    }

    // Table formatting
    statusUpdate()
    hideEmpty()

    //Interface build
    createInterface()

}

function fillTable(section_table, table_data) {
    if (dbType === 'ANIME') {
        createHead(section_table, ["Title", "Score", "Episodes", "Thoughts"], ["Country", "Year", "Genre", "Duration"])
        createBody(section_table, table_data, ["title.english", "score", "watched_episodes", "thoughts"], ["countryOfOrigin", "startDate.year", "genres", "duration"])
    }
    if (dbType === 'MANGA') {
        createHead(
            section_table, 
            ["Title", "Score", "Chapters", "Thoughts"], 
            ["Country", "Year", "Genre"])
        createBody(
            section_table, 
            table_data, 
            ["title.english", "score", "read_chapters", "thoughts"], 
            ["countryOfOrigin", "startDate.year", "genres"])
    }
    else if (dbType === 'MOVIE') {
        createHead(section_table, ["Title", "Score", "Thoughts"], ["Country", "Year", "Genre", "Duration"])
        createBody(section_table, table_data, ["title.english", "score", "thoughts"], ["countryOfOrigin", "startDate.year", "genres", "duration"])
    }
    else {
        console.log("Unsuported file type")
    }
}

function createHead(tableSection, visibleColumnHeaders, invisibleColumnHeaders) {
    var tableHead = document.createElement('thead');
    var tableRow = document.createElement('tr');
    let tableHeaders = '';

    // Generate visible column headers
    for (let headerValue of visibleColumnHeaders) {
        tableHeaders += `<th>${headerValue}</th>`;
    }

    // Generate invisible column headers if provided
    if (invisibleColumnHeaders && invisibleColumnHeaders.length > 0) {
        for (let headerValue of invisibleColumnHeaders) {
            tableHeaders += `<th class="hiddenTd">${headerValue}</th>`;
        }
    }

    // Set the innerHTML of the tableRow
    tableRow.innerHTML = tableHeaders;

    // Append the tableRow to the tableHead
    tableHead.appendChild(tableRow);

    // Append the tableHead to the specified table section
    tableSection.appendChild(tableHead);
}

function createBody(section_table, section_data, visible_bdargs, invisible_bdargs = []) {
    function getNestedValue(obj, keys) {
        return keys.reduce((nestedObj, key) => (nestedObj && nestedObj[key] !== undefined) ? nestedObj[key] : undefined, obj);
    }

    var tbody = document.createElement("tbody");

    // Loop through section_data (single entry or array of entries)
    for (let entry_index = 0; entry_index < section_data.length; entry_index++) {
        let tr = document.createElement('tr');
        let visible_t_body = '';
        let invisible_t_body = '';

        // Visible rows
        for (let parameter of visible_bdargs) {
            let keys = parameter.split(".");
            let nestedValue = getNestedValue(section_data[entry_index], keys);

            // Check if the nestedValue is null and change it to an empty string
            nestedValue = (nestedValue !== null) ? nestedValue : '';

            visible_t_body += `<td>${nestedValue}</td>`;
        }

        // Invisible rows
        for (let parameter of invisible_bdargs) {
            let keys = parameter.split(".");
            let nestedValue = getNestedValue(section_data[entry_index], keys);

            invisible_t_body += `<td class="hiddenTd">${nestedValue}</td>`;
        }

        // Set the innerHTML of the tr element with both visible and invisible rows
        tr.innerHTML = visible_t_body + invisible_t_body;

        tbody.appendChild(tr);

        // Append the tr to the specified table section
        section_table.appendChild(tbody);
    }
}

function searchTable(parameter, unwantedClasses = null) {
    var listItems = document.querySelectorAll("li");
    var results = [];  

    listItems.forEach(function (item) {
        var table = item.querySelector("table");

        if (table) {
            var rows = table.querySelectorAll("tr");
            var head = table.querySelectorAll("th");

            var parameter_index = Array.from(head).findIndex(th => th.textContent === parameter);

            if (parameter_index !== -1) {
                // Start the loop from index 1 to ignore the table head
                for (var rowIndex = 1; rowIndex < rows.length; rowIndex++) {
                    var cells = rows[rowIndex].querySelectorAll('td');

                    var noProblem = true;

                    // Check if entry class is unwanted
                    if (unwantedClasses !== null) {
                        unwantedClasses.forEach(function (unwantedClass) {
                            if (rows[rowIndex] && rows[rowIndex].classList.contains(unwantedClass)) {
                                noProblem = false;
                            }
                        });
                    }  

                    if (noProblem) {
                        results.push({
                            entry_name: cells[0].textContent,
                            value: cells[parameter_index].textContent,
                            rowIndex: rowIndex,
                            listId: item.id
                        });
                    }
                }
            }
        }
    });

    if (results.length === 0) {
        console.log("Parameter not found in any table.");
        return "NOT FOUND";
    }
    return results;
}

function findTable(parameter, desired_entry, unwantedClasses = null) {
    var entries = searchTable(parameter, unwantedClasses);
    var found_results = [];
    var unmatched_results = [];

    if (entries === "NOT FOUND")
        return false

    entries.forEach(function (entry) {
        // Check if parameter_index is within bounds and cells array has elements
        if (entry.value.includes(desired_entry)) {
            console.log("Passed" + entry.entry_name)
            found_results.push({
                value: entry.entry_name,
                rowIndex: entry.rowIndex,
                listId: entry.listId
            });
        } else {
            unmatched_results.push({
                value: entry.entry_name ? entry.entry_name : "N/A",
                rowIndex: entry.rowIndex,
                listId: entry.listId
            });
        }
    });
    return [found_results, unmatched_results];
}

function focusEntry(parameter, desired_entry, hiddenClass, unwantedClasses=null) {
    // HiddenClass = class to hide unwanted elements; SHOULD BE STRING
    // Unwanted class = Classes to ignore during search; SHOULD BE ARRAY

    var [found_results, unmatched_results] = findTable(parameter, desired_entry, unwantedClasses);
    if (found_results[0] === "NOT FOUND") {
        console.log("Operation stopped since the desired value wasn't found");
        return false;
    }

    found_results.forEach(function (entry) {
        var listItem = document.querySelector("#" + entry.listId);

        var table = listItem.querySelector("table");
        var rows = table.querySelectorAll("tr");

        if (rows[entry.rowIndex] && rows[entry.rowIndex].classList.contains(hiddenClass)) {
            rows[entry.rowIndex].classList.remove(hiddenClass);
        }
    });

    unmatched_results.forEach(function (entry) {
        var listItem = document.querySelector("#" + entry.listId);

        var table = listItem.querySelector("table");
        var rows = table.querySelectorAll("tr");

        if (rows[entry.rowIndex]) {
            rows[entry.rowIndex].classList.add(hiddenClass);
            console.log(rows[entry.rowIndex])
        }
    });

    //Update table formatting
    statusUpdate();
    hideEmpty();

    return true;
}

function unfocusEntry(toDisselectArray = null) {
    var listItems = document.querySelectorAll("li");

    listItems.forEach(function (item) {
        var table = item.querySelector("table");

        var allOptions = toDisselectArray || []; // Use the provided array or an empty array
        var toDisselect = allOptions.filter(option => allOptions.includes(option));

        var rows = table.querySelectorAll("tr");

        for (var i = 0; i < rows.length; i++) {
            toDisselect.forEach(function (disselectOption) {
                if (rows[i].classList.contains(disselectOption)) {
                    rows[i].classList.remove(disselectOption);
                }
            });
        }
    });

    statusUpdate();
    hideEmpty();
}

function hideEmpty() {
    var listItems = document.querySelectorAll("li");
    
    for (let listIndex = 1; listIndex < listItems.length; listIndex++){
        item = listItems[listIndex]

        let table = item.querySelector("table");
        var tbody = table.querySelector("tbody");

        var allHidden = true; // All rows of a given table are hidden?

        if (tbody !== null) {
            var rows = tbody.querySelectorAll("tr");
    
            // Ignore head
            for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
                var row = rows[rowIndex];

                var passAmount = 0;

                for (let hiddenIndex = 0; hiddenIndex < hiddenList.length; hiddenIndex++) {
                    var hiddenParameter = hiddenList[hiddenIndex];
                    
                    if (!row.classList.contains(hiddenParameter)) {
                        passAmount++;
                    }
                }

                // It's lazy, but works. HAHAHA
                if (passAmount === hiddenList.length) {
                    allHidden = false;
                    break;
                }
            }
        }

        //Display settings
        if (allHidden === true) {
            item.classList.add("hiddenLi")
        }
        else {
            item.classList.remove("hiddenLi")
        }
    }
}

function statusUpdate() {
    if (dbType == "ANIME") {
        var table = document.getElementById("table_Info");
        var tbodyElement = table.querySelector("tbody").querySelector("tr");

        var tbody_html = '';

        // New info
        var episodes_list = searchTable("Episodes", hiddenList);
        var runtime_list = searchTable("Duration", hiddenList);
        if (runtime_list !== "NOT FOUND") {
            var total_shows = runtime_list.length;
        } 
        else {
            var total_shows = "NaN";
        }

        //Calculate info
        var episodes_watched = 0;
        var total_time = 0;
        
        for (var i = 0; i < episodes_list.length; i++) {
            episodes_watched += parseInt(episodes_list[i].value, 10);
            total_time += parseInt(episodes_list[i].value, 10)*parseInt(runtime_list[i].value, 10);
        }
        
        // Update info
        tbody_html += `<td>${total_shows} animes</td>`;
        tbody_html += `<td>${episodes_watched} episodes</td>`;
        tbody_html += `<td>${(total_time/60).toFixed(2)} horas</td>`;
        tbody_html += `<td>${((total_time / 60) / 24).toFixed(2)} dias</td>`;

        tbodyElement.innerHTML = tbody_html
    }

    else if (dbType == "MANGA") {
        var table = document.getElementById("table_Info");
        var tbodyElement = table.querySelector("tbody").querySelector("tr");

        var tbody_html = '';

        // New info
        var chapters_list = searchTable("Chapters", hiddenList);
        if (chapters_list !== "NOT FOUND") {
            var total_manga = chapters_list.length;
        }
        else {
            var total_manga = "NaN";
        }

        //Calculate info
        var chapters_read = 0;

        for (var i = 0; i < chapters_list.length; i++) {
            chapters_read += parseInt(chapters_list[i].value, 10);
        }

        // Update info
        tbody_html += `<td>${total_manga} mangas</td>`;
        tbody_html += `<td>${chapters_read} chapters</td>`;

        tbodyElement.innerHTML = tbody_html
    }

    else if (dbType == "MOVIE") {
        var table = document.getElementById("table_Info");
        var tbodyElement = table.querySelector("tbody").querySelector("tr");

        var tbody_html = '';

        // New info
        var duration_list = searchTable("Duration", hiddenList);
        var total_movies = searchTable("Title", hiddenList).length;

        //Calculate info
        var total_time = 0;

        for (var i = 0; i < total_movies; i++) {
            total_time += parseInt(duration_list[i].value, 10);
        }

        // Update info
        tbody_html += `<td>${total_movies} movies</td>`;
        tbody_html += `<td>${(total_time / 60).toFixed(2)} horas</td>`;
        tbody_html += `<td>${((total_time / 60) / 24).toFixed(2)} dias</td>`;

        tbodyElement.innerHTML = tbody_html
    }
}

function getData(ParameterToGet, unwantedClass) {
    var parameterList = [];
    var parametersFound = searchTable(ParameterToGet, unwantedClass);

    parametersFound.forEach(function (yearEntry) {
        var options = yearEntry.value.split(",");

        options.forEach(function (option) {
            if (!parameterList.includes(option)) {
                parameterList.push(option);
            }
        });
    });
    return parameterList
}

// USER INTERFACE
function createInterface() {
    // Title search
    var searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "Title";
    searchInput.id = `InputTitle`;
    searchInput.addEventListener("input", function () {
        focusEntry("Title", searchInput.value, "hiddenTitle");
    });

    document.getElementById("interface_box").appendChild(searchInput)
    
    // Genre dropdown
    createDropdown(
        "interface_box", 
        "Genre", 
        getData("Genre", hiddenList)
    );

    // Country dropdown
    createDropdown(
        "interface_box", 
        "Country", 
        getData("Country", hiddenList)
    );

    // Country dropdown
    createDropdown(
        "interface_box",
        "Score",
        ["Favorite", "Excellent", "Good", "Meh", "Bad", "Horrible"]
    );

    createSlider(
        "interface_box",
        "Year",
        getData("Year", hiddenList)
    );
}

function createDropdown(boxToPlace, DropdownName, parameterGet) {
    // Create Dropdown div
    var dropdownDiv = document.createElement("div");
    dropdownDiv.id = `${DropdownName}Dropdown`;

    //Create Button
    MainButton = createButton(DropdownName);
    dropdownDiv.appendChild(MainButton);

    // Create list div
    var ListDiv = document.createElement("div");
    ListDiv.id = `${DropdownName}List`
    ListDiv.classList.add(`DropList`);

    //Hidden class
    var hiddenClass = `hidden${DropdownName}`

    //Populate list div
    populatedListDIv = populateDropdown(ListDiv, parameterGet, DropdownName, hiddenClass, MainButton)

    // Add a click event listener to stop propagation when clicking inside the dropdown
    ListDiv.addEventListener("click", function (event) {
        event.stopPropagation();
    });

    //Append listDiv
    dropdownDiv.appendChild(ListDiv);
    
    document.getElementById(boxToPlace).appendChild(dropdownDiv);
}

function createButton(DropdownName) {
    // Create main button
    var MainButton = document.createElement("Button");
    MainButton.innerText = DropdownName;
    MainButton.addEventListener("click", function () {
        showDropDown(`${DropdownName}List`);
    });
    MainButton.id = `${DropdownName}Button`;
    MainButton.classList.add(`${DropdownName}Button`);
    
    return MainButton;
}

function createOptionButton(text, clickHandler) {
    var button = document.createElement("button");
    button.addEventListener("click", function (event) {
        if (event) {
            event.stopPropagation();
        }
        clickHandler();
    });
    button.classList.add("drop_opt");
    button.innerText = text;
    return button;
}

function showDropDown(DropdownId) {
    if (DropdownId === "CountryList") {
        // Make other dropdown retract
        if (document.getElementById("GenreList").classList.contains("show")) {
            document.getElementById("GenreList").classList.remove("show");
        }
        else if (document.getElementById("ScoreList").classList.contains("show")) {
            document.getElementById("ScoreList").classList.remove("show");
        }
        //Expand desired dropdown
        document.getElementById(DropdownId).classList.toggle("show");
    }
    else if (DropdownId === "GenreList") {
        if (document.getElementById("CountryList").classList.contains("show")) {
            document.getElementById("CountryList").classList.remove("show");
        }
        else if (document.getElementById("ScoreList").classList.contains("show")) {
            document.getElementById("ScoreList").classList.remove("show");
        }
        document.getElementById(DropdownId).classList.toggle("show");
    }
    else if (DropdownId === "ScoreList") {
        if (document.getElementById("GenreList").classList.contains("show")) {
            document.getElementById("GenreList").classList.remove("show");
        }
        else if (document.getElementById("CountryList").classList.contains("show")) {
            document.getElementById("CountryList").classList.remove("show");
        }
        document.getElementById(DropdownId).classList.toggle("show");
    }
}

function populateDropdown(ListDiv, parameterGet, DropdownName, hiddenClass, MainButton) {
    //Ensure, it's brand new
    ListDiv.innerHTML = "";
    
    //Add search
    var searchInput = createSearch(ListDiv, DropdownName)
    ListDiv.appendChild(searchInput)

    // Create option buttons
    parameterGet.forEach(function (item) {
        var OptionButton = createOptionButton(item, function (event) {
            if (event) {
                event.stopPropagation();
            }
            // Originally selected
            if (OptionButton.classList.contains("selectedDropOpt")){
                OptionButton.classList.remove("selectedDropOpt"); 
                ListDiv.classList.remove("selectedOpt");
                
                //Reset focus
                unfocusEntry([hiddenClass]);

                //Reset button
                MainButton.classList.remove("selectedButton") //Change color back
                MainButton.innerText = DropdownName//Change button name
                
            }
            // Originally not selected
            else {
                if (ListDiv.classList.contains("selectedOpt")) {
                    if (ListDiv.classList.contains("selectedOpt")) {
                        var possibleButtonList = ListDiv.querySelectorAll("Button")

                        // Remove previous selection
                        for (var index = 0; index < possibleButtonList.length; index++) {
                            var possibleButton = possibleButtonList[index];

                            if (possibleButton.classList.contains("selectedDropOpt")) {
                                possibleButton.classList.remove("selectedDropOpt");
                                break;
                            }
                        }

                        //Set new focus
                        unfocusEntry([hiddenClass])
                        focusEntry(DropdownName, item, hiddenClass);

                        //Add new selection
                        OptionButton.classList.add("selectedDropOpt")
                    }
                    OptionButton.classList.add("selectedDropOpt")
                }
                else {
                    OptionButton.classList.add("selectedDropOpt") //Make it go green
                    ListDiv.classList.add("selectedOpt"); //Add class to show one option already selected, stopping further selections

                    focusEntry(DropdownName, item, hiddenClass);
                }

                MainButton.classList.add("selectedButton") //Change color
                MainButton.innerText = OptionButton.innerText //Change button name
            }
        });
        ListDiv.appendChild(OptionButton);
    });

    return ListDiv
}

function createSearch(dropdownDiv, DropdownName) {
    // Add search input dynamically
    var searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = DropdownName;
    searchInput.id = `Input${dropdownDiv.id}`;
    searchInput.addEventListener("input", function () {
        filterFunction(dropdownDiv.id);
    });

    // Search filtering config
    searchInput.addEventListener("click", function (event) {
        event.stopPropagation();
    });

    return searchInput
}

// Function to filter genre options based on user input
function filterFunction(DropdownId) {
    var input, filter, div, buttons, i, txtValue;
    input = document.getElementById(`Input${DropdownId}`);
    filter = input.value.toUpperCase();
    div = document.getElementById(DropdownId);
    buttons = div.getElementsByClassName("drop_opt");

    for (i = 0; i < buttons.length; i++) {
        txtValue = buttons[i].textContent || buttons[i].innerText;
        buttons[i].style.display = txtValue.toUpperCase().indexOf(filter) > -1 ? "" : "none";
    }
}

function createSlider(boxToPlace, sliderName, parameterGet) {
    var slider = document.createElement("input");
    slider.type = "range";
    slider.id = `${sliderName}Slider`;
    slider.classList.add(`${sliderName}Slider`);

    var sliderValueDiv = document.createElement("div");
    sliderValueDiv.id = `${sliderName}SliderValueDiv`;
    sliderValueDiv.classList.add(`${sliderName}SliderValueDiv`);

    var sliderValueText = document.createElement("h3");
    sliderValueText.id = `${sliderName}SliderValueDiv`;
    sliderValueText.classList.add(`${sliderName}SliderValueText`);

    // Add min and max to slider
    var maxYear = 0;
    var minYear = 5000;

    parameterGet.forEach(function (year) {
        if (year > maxYear) {
            maxYear = year;
        } else if (year < minYear) {
            minYear = year;
        }
    });

    slider.min = minYear - 1;
    slider.max = maxYear;

    // Behaviour config
    hiddenClass = [`hidden${sliderName}`];
    slider.addEventListener('input', function () {
        if (slider.value === slider.min) {
            unfocusEntry(hiddenClass);
        } else {
            console.log([sliderName, slider.value, hiddenClass])
            focusEntry(sliderName, slider.value, hiddenClass);
        }

        // Update slider text
        sliderValueText.innerText = slider.value;
    });

    slider.addEventListener('mousedown', function () {
        document.getElementById(sliderValueDiv.id).classList.add("show");
    });

    slider.addEventListener('mouseup', function () {
        document.getElementById(sliderValueDiv.id).classList.remove("show");
    });

    // Add an additional event listener for mousemove to update the text position continuously
    slider.addEventListener('mousemove', function () {
        if (document.getElementById(sliderValueDiv.id).classList.contains("show")) {
            updateTextPosition();
        }
    });

    function updateTextPosition() {
        // Calculate the left position for the text
        var thumbWidth = 16; // Adjust this value based on your design
        var textLeft = ((slider.value - slider.min) / (slider.max - slider.min)) * (slider.offsetWidth - thumbWidth);

        // Set the left position for the text
        sliderValueText.style.left = textLeft + 'px';
    }

    document.getElementById(boxToPlace).appendChild(slider);
    sliderValueDiv.appendChild(sliderValueText);
    document.getElementById(boxToPlace).appendChild(sliderValueDiv);
}