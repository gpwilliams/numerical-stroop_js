/* ----------------------------------------------------------------------------------------------------------
Numerical Stroop Task: Highest Value
-------------------------------------------------------------------------------------------------------------
BUG: If people get only 1 set of 3 items, then they are all assigned to the left.
BUG: If you get an odd number of items, the first 3 items will always be left.
FIX: multiply item generation by even number (i.e. *6) 
        so you get even numbers of conditions & left/right correct responses
*/

// stop linting problems for global vars (up to setTimeout) vars defined in other functions
/*global window document localStorage setTimeout fixCross leftValue rightValue */

// define variables in global scope
var globalGlenn = {state: 'FIXATION_SCREEN', numberSet: [], trialNumber: 0, leftRightPressed: false,
startTime: Date.now(), endTime: 0, RT: 0, section: 'practice', trialTimeout: 750};

window.addEventListener('keydown', fixScreen, false);

window.onload = function() {
	//run the practice section function; do one run (i.e. 1 version of each condition (1*6))
	practiceSection();
}

function generateFinalItems(nTotal) {
	var totalItems = nTotal;
    var conditionCount = 3;
	var congruentItems = generateItemsForCondition('congruent', totalItems/conditionCount);
	var incongruentItems = generateItemsForCondition('incongruent', totalItems/conditionCount);
	var neutralItems = generateItemsForCondition('neutral', totalItems/conditionCount);
	globalGlenn.numberSet = drawItemsFromCondition(congruentItems, incongruentItems, neutralItems, totalItems);
}

function practiceSection() {
	//multiply the entry by 6 to allow for presentation of an equal number of items from each condition
    var itemMultiple = 6; // should be globally accessible
	generateFinalItems((localStorage.getItem("practiceRuns"))*itemMultiple);
	//create text elements for introduction
	setTimeout(getNumbers, globalGlenn.trialTimeout);
}

function experimentalSection() {
	globalGlenn.section = 'experimental';
	globalGlenn.trialNumber = 0;
	//get number of experimental items, *6 to keep even number for conditions, and even l/r response
	generateFinalItems((localStorage.getItem("experimentalRuns"))*6);
	globalGlenn.state = 'FIXATION_SCREEN';
	fixCross.innerHTML = '+';
	leftValue.innerHTML = '';
	rightValue.innerHTML = '';
	setTimeout(getNumbers, globalGlenn.trialTimeout);
}

function getNumbers() {
	//reset all font sizes to 6em and set the state to the experimental screen
	//replace the left and right values with those generated at window.onload and replace the fix cross with a space
	document.getElementById('leftValue').style = "font-size: 6em;"
	document.getElementById('rightValue').style = "font-size: 6em;"
	globalGlenn.state = 'EXPERIMENTAL_SCREEN';
	var fixCross = document.getElementById('fixCross');
	var leftValue = document.getElementById('leftValue');
	var rightValue = document.getElementById('rightValue');
	fixCross.innerHTML = '&nbsp&nbsp&nbsp';
	leftValue.innerHTML = globalGlenn.numberSet[globalGlenn.trialNumber].first;
	rightValue.innerHTML = globalGlenn.numberSet[globalGlenn.trialNumber].second;
	if (globalGlenn.numberSet[globalGlenn.trialNumber].condition === "congruent") {
		if (globalGlenn.numberSet[globalGlenn.trialNumber].first >
			globalGlenn.numberSet[globalGlenn.trialNumber].second) {
			document.getElementById('leftValue').style = "font-size: 12em;";
		}
		else {
			document.getElementById('rightValue').style = "font-size: 12em;";
		}
	}
	else if (globalGlenn.numberSet[globalGlenn.trialNumber].condition === "incongruent") {
		if (globalGlenn.numberSet[globalGlenn.trialNumber].first >
			globalGlenn.numberSet[globalGlenn.trialNumber].second) {
			document.getElementById('rightValue').style = "font-size: 12em;";
		}
		else {
			document.getElementById('leftValue').style = "font-size: 12em;";
		}
	}
	//reset timer for RT
	globalGlenn.startTime = Date.now();
}

//listens for an event, progresses if space pressed (and on experimental screen)
function fixScreen(e) {
	var fixCross = document.getElementById('fixCross');
	var leftValue = document.getElementById('leftValue');
	var rightValue = document.getElementById('rightValue');

	//define time start of trial
	//listen for user response

	//if left pressed or right pressed, record these events
	if ((globalGlenn.leftRightPressed === false) && (e.key === 'ArrowLeft')
		&& (globalGlenn.state === 'EXPERIMENTAL_SCREEN')) {
		//stop progression/changing answers
		globalGlenn.leftRightPressed = true;
		globalGlenn.numberSet[globalGlenn.trialNumber].userResponse = 'left';
		//define time at key press & pushing values
		globalGlenn.endTime = Date.now();
		globalGlenn.RT = globalGlenn.endTime - globalGlenn.startTime;
		// RT = trial end - trial start
		globalGlenn.numberSet[globalGlenn.trialNumber].RT = globalGlenn.RT //push RT;
		document.getElementById('leftValue').style.border = "4px black solid";
	} else if ((globalGlenn.leftRightPressed === false) && (e.key === 'ArrowRight')
		&& (globalGlenn.state === 'EXPERIMENTAL_SCREEN')) {
		//stop progression/changing answers
		globalGlenn.leftRightPressed = true;
		globalGlenn.numberSet[globalGlenn.trialNumber].userResponse = 'right';
		//define time at key press & pushing values
		globalGlenn.endTime = Date.now();
		globalGlenn.RT = globalGlenn.endTime - globalGlenn.startTime;
		globalGlenn.numberSet[globalGlenn.trialNumber].RT = globalGlenn.RT //push RT;
		document.getElementById('rightValue').style.border = "4px black solid";
	}

	//if space bar is pressed, record this event
	//progress: replace screen with fixation cross if space is pressed, increment trial number by 1
	if ((e.key === ' ') && (globalGlenn.state === 'EXPERIMENTAL_SCREEN') && (globalGlenn.leftRightPressed === true)) {
		globalGlenn.leftRightPressed = false;
		//define start reaction time for RT
		document.getElementById('leftValue').style.border = '';
		document.getElementById('rightValue').style.border = '';
		globalGlenn.state = 'FIXATION_SCREEN';
		fixCross.innerHTML = '+';
		leftValue.innerHTML = '';
		rightValue.innerHTML = '';
		globalGlenn.trialNumber += 1;

		// keep running trials or not?
		// if you still have some trials left to run, then keep running the trials
		if (globalGlenn.trialNumber < globalGlenn.numberSet.length) {
			setTimeout(getNumbers, globalGlenn.trialTimeout);
			// otherwise, if you've finished your trials, see if you're on the practice screen
			// if so, replace the screen with a question
		} else if ((globalGlenn.trialNumber >= globalGlenn.numberSet.length) && (globalGlenn.section === 'practice')) {
			//check for practice trials being complete. If so, replace screen with question prior to progression
			fixCross.innerHTML = '';
			leftValue.innerHTML = '';
			rightValue.innerHTML = '';
			document.getElementById('questionText').innerHTML =
			'Well done! \n If you have any questions about the study, ask now.<br> Otherwise, please press <b>Enter</b> to continue.';
			//check for experimental trials being complete. If so, start the debrief section
		} else if ((globalGlenn.trialNumber >= globalGlenn.numberSet.length) && (globalGlenn.section === 'experimental')) {
			//stop: can't progress (run out of trials)
			window.removeEventListener('keydown', fixScreen);
			//force next screen -- debrief & results
			createDebriefScreen();
		}
	}

	//progress from the question screen if you're on it. Run the experimental trials if enter is pressed
	if ((e.key === 'Enter') && (globalGlenn.trialNumber >= globalGlenn.numberSet.length) &&
	(globalGlenn.section === 'practice')) {
	//remove text
	var parent = document.getElementById('questionDiv');
	var child = document.getElementById('questionText');
	parent.removeChild(child);

	experimentalSection();
	}
}

//randomise array
function randomiseArray(array) {
	//generate random values for array
	for (var i = 0; i < array.length; i++) {
		array[i].value = Math.random();
	}

	//create a function to compare objects by their random values
	function compareNumber(a, b) {
		return (a.value) - (b.value);
	}

	//sort array by their (compared) random values
	array.sort(compareNumber);

	//return values back to proper order
	for (var ii = 0; i < array.length; ii++) {
		array[ii].value = ii;
	}
	//return the array
	return array;
}

function generateItemsForCondition(condition, itemNumber) {
	//always have half highest value on left, half on right.

	var nLength = 0;
	var valFirst = 0;
	var valSecond = 0;
	var valItem = [];
	var bigger, smaller;
    var conditionID;
    
    for (nLength; nLength < itemNumber; nLength++) {
        valFirst = Math.floor(Math.random()*10);
        valSecond = Math.floor(Math.random()*10);
        while (valSecond === valFirst) {
            valSecond = Math.floor(Math.random()*10);
        }  
        
        //compare values, see which is largest for each item; half go left, half right
        if (valFirst > valSecond) {
            bigger = valFirst;
            smaller = valSecond;
        } else {
            bigger = valSecond;
            smaller = valFirst;
        }
        
        // define condition for pushing 
        if (condition === 'congruent') {
            conditionID = 'congruent';
        } else if (condition === "incongruent") {
            conditionID = 'incongruent';
        } else if (condition === 'neutral') {
            conditionID = 'neutral';
        }
        
        // determine which item is larger
        if(nLength % 2 == 0) {
            valItem.push({first: bigger, second: smaller, correct_response: 'left', condition: conditionID});
        } else {
            valItem.push({first: smaller, second: bigger, correct_response: 'right', condition: conditionID});
        }
    }
	return randomiseArray(valItem);
}

function drawItemsFromCondition(conditionOne, conditionTwo, conditionThree) {

	var allItems = [];
	var diceThrow = 0;
	var diceThrowPrev = 0;
	var diceThrowPrevPrev = 0;
	var rerollCounter = 0;
	var diceThrowCounter = [{'ones': 0, 'twos': 0, 'threes': 0}];
	var condOneLoopCounter = 0;
	var condTwoLoopCounter = 0;
	var condThreeLoopCounter = 0;
	var nLengthOfItems = conditionOne.length + conditionTwo.length + conditionThree.length;

	for (var ii = 0; ii < nLengthOfItems; ii++) {

		diceThrowPrevPrev = diceThrowPrev;
		diceThrowPrev = diceThrow;

		//roll a 3 sided die
		diceThrow = getRandomInt(1, 3);

		//first, check iteration is over 2, and check 2 previous values match current roll, reroll if so
		//check if the value has been rolled too often, reroll if so
		while ((ii > 2 && (diceThrow === diceThrowPrev) && (diceThrow === diceThrowPrevPrev)) ||
			(diceThrow === 1 && diceThrowCounter[0].ones >= nLengthOfItems/3) ||
			(diceThrow === 2 && diceThrowCounter[0].twos >= nLengthOfItems/3) ||
			(diceThrow === 3 && diceThrowCounter[0].threes >= nLengthOfItems/3)) {
			diceThrow = getRandomInt(1, 3);
			rerollCounter += 1;
			//check for crash, reset everything and break out if so
			if (rerollCounter > 200) {
				allItems = [];
				diceThrow = 0;
				diceThrowPrev = 0;
				diceThrowPrevPrev = 0;
				diceThrowCounter = [{'ones': 0, 'twos': 0, 'threes': 0}];
				condOneLoopCounter = 0;
				condTwoLoopCounter = 0;
				condThreeLoopCounter = 0;
				ii = -1;
				break;
			}
		}
		//reset reroll counter because the roll worked; no crash!
		rerollCounter = 0;

		//add the value from this array to your master array, increment your loop counter
		//also increment the dice roll counter according to value
		if (diceThrow === 1) {
			allItems.push(conditionOne[condOneLoopCounter]);
			condOneLoopCounter += 1;
			diceThrowCounter[0].ones += 1;
		} else if (diceThrow === 2) {
			allItems.push(conditionTwo[condTwoLoopCounter]);
			condTwoLoopCounter += 1;
			diceThrowCounter[0].twos += 1;
		} else if (diceThrow === 3) {
			allItems.push(conditionThree[condThreeLoopCounter]);
			condThreeLoopCounter += 1;
			diceThrowCounter[0].threes += 1;
		} else {
			//do nothing.
		}
	}
	//make value equal to the presentation order for each item
	for (var jj = 0; jj < allItems.length; jj ++) {
		allItems[jj].value = jj;
	}
	return allItems;
}

//generate random integers
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//generate item, check if in our final array, if it isn't add it to the array, if it is, generate a new one.
function removeDisplayElements() {
	var parent = document.getElementById('displayElements');
	var child = '';
	var displayElementNames = ['leftValue', 'rightValue', 'fixCross']

	for (var eachDisplay = 0; eachDisplay < displayElementNames.length; eachDisplay++) {
		child = document.getElementById(displayElementNames[eachDisplay]);
		parent.removeChild(child);
	}
}

function createDebriefScreen() {
	//clear the elements for stimulus presentation
	//delete the elements for the numbers & fix cross
	//need to retrieve parent and child elements to do so
	removeDisplayElements();

	//create title, table, and elements
	var tableTitle = document.createElement("H1");
	var tableTitleText = document.createTextNode("Results: Experimental Items");
	tableTitle.appendChild(tableTitleText);

	var debriefElement = document.createElement("p");
	debriefElement.id = 'debriefText';
	var debriefElementText = document.createTextNode("Thank you for taking part in our study. This experiment looked at the Numerical Stroop Effect, a measure of inhibition and cognitive load on reaction times and accuracy. We expect that you will be fastest and most accurate when the highest value is in the largest font, and slowest when the highest value is in the smallest font. You can find your results below.");
	debriefElement.appendChild(debriefElementText);
	var outputTable = document.createElement("table");

	//instantiate the variables to output (including cell headings)
	var tableRow;
	var cellData;
	var tableCellHeadings = ['Trial', 'Condition', 'Left Value', 'Right Value',
	'Correct Response', 'User Response', 'Response Match?', 'Reaction Time (ms)', 'Age', 'Gender'];
	var varyingIndexes = ['value', 'condition', "first", "second",
	'correct_response', 'userResponse', 'correct', 'RT', 'age', 'gender'];

	//add individual cell headings (e.g. item number, condition)
	tableRow = document.createElement("tr");
	outputTable.appendChild(tableRow);

	for (var cellHeading = 0; cellHeading < tableCellHeadings.length; cellHeading++) {
		cellData = document.createElement("th");
		cellData.innerHTML = tableCellHeadings[cellHeading];
		tableRow.appendChild(cellData);
	}

	//loop through values and add to table as above
	for (var cellRows = 0; cellRows < globalGlenn.numberSet.length; cellRows++) {
		tableRow = document.createElement("tr");
		outputTable.appendChild(tableRow);
		for (var cellResponses = 0; cellResponses < varyingIndexes.length; cellResponses++) {
			cellData = document.createElement("td");

			//switch statement: if values aren't stored in the data, calculate them on the fly
			switch (varyingIndexes[cellResponses]) {
				case 'value':
					cellData.innerHTML = globalGlenn.numberSet[cellRows].value +1;
					break;
				case 'correct':
					if (globalGlenn.numberSet[cellRows].userResponse === globalGlenn.numberSet[cellRows].correct_response) {
						cellData.innerHTML = 'yes';
					} else {
						cellData.innerHTML = 'no';
					}
					break;
				case 'age':
					cellData.innerHTML = localStorage.getItem("ageData");
					break;
				case 'gender':
					cellData.innerHTML = localStorage.getItem("genderData");
					break;
				default:
					cellData.innerHTML = globalGlenn.numberSet[cellRows][varyingIndexes[cellResponses]];
					break;
			}
			tableRow.appendChild(cellData);
		}
	}
	//append the table to the body of the HTML
	document.body.appendChild(tableTitle);
	document.body.appendChild(debriefElement);
	document.body.appendChild(outputTable);
}
