
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';

let flights = [];

(async() => {

    let result = null;
    let contract = new Contract('localhost', () => {

        for (var i = 0; i < getRandomInt(10) + 10; i++) {
            flights.push({ id: 'flight_' + i, departure: randomDate(new Date(), new Date(2030, 0, 1)) });
        }

        // Read transaction
        // contract.isOperational((error, result) => {
        //     console.log(error,result);
        //     display('Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
        // });

        displayFlightList();
    
        // // User-submitted transaction
        // DOM.elid('submit-oracle').addEventListener('click', () => {
        //     let flight = DOM.elid('flight-number').value;
        //     // Write transaction
        //     contract.fetchFlightStatus(flight, (error, result) => {
        //         display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp} ]);
        //     });
        // })
    
    });
    

})();


function display(title, description, results) {
    let displayDiv = DOM.elid("display-wrapper");
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.append(section);

}

function buyInsuranceHandler() {
    var textinputElement = DOM.elid('textinput_' + this.getAttribute('data-id'));
    console.log(textinputElement.value);
    let insurancefee = parseFloat(textinputElement.value);
    console.log(insurancefee);
    if (insurancefee < 0 || insurancefee > 1) {
        alert('insurance fee must be between 0.0 and 1.0 ETH');
    } else {
        alert('ok, go with ' + insurancefee);

    }
}

function addFlightSaveHandler() {

}

function addFlightCancelHandler() {

}

function addFlight() {
    let rowClass = '';
    let displayDiv = DOM.elid('flightlist');
    let len = displayDiv.childNodes.length;
    let firstRow;

    for (var i = 0; i < len; i++) {
        if (displayDiv.childNodes[i].classList) {
            let classLen = displayDiv.childNodes[i].classList.length;
            for (var j = 0; j < classLen; j++) {
                if (displayDiv.childNodes[i].classList[j] == 'even') {
                    firstRow = displayDiv.childNodes[i];
                    rowClass = 'odd';
                    j = classLen;
                    i = len;
                } else if (displayDiv.childNodes[i].classList[j] == 'odd') {
                    firstRow = displayDiv.childNodes[i];
                    rowClass = 'even';
                    j = classLen;
                    i = len;
                }
            }
        }
    }

    let newIndex = parseInt(displayDiv.childNodes[len - 1].firstChild.textContent.substring(displayDiv.childNodes[len - 1].firstChild.textContent.lastIndexOf('_') + 1)) + 1;
    let dateinput = DOM.input({ id: 'dateinput_' + newIndex, type: 'date' });
    let timeinput = DOM.input({ id: 'timeinput_' + newIndex, type: 'time' });
    let savebutton = DOM.button({ id: 'newbutton_' + i, className: 'btn btn-primary'}, 'save');
    savebutton.addEventListener('click', addFlightSaveHandler);
    let cancelbutton = DOM.button({ id: 'newbutton_' + i, className: 'btn btn-primary'}, 'cancel');
    cancelbutton.addEventListener('click', addFlightCancelHandler);

    let row = DOM.div({className:'row ' + rowClass});

    row.appendChild(DOM.div({className: 'col-sm-2 field'}, 'flight_' + newIndex));
    row.appendChild(DOM.div({className: 'col-sm-2 field'}, dateinput));
    row.appendChild(DOM.div({className: 'col-sm-2 field'}, timeinput));
    row.appendChild(DOM.div({className: 'col-sm-4 field'}, '---'));
    row.appendChild(DOM.div({className: 'col-sm-1 field no-right-paddding'}, savebutton));
    row.appendChild(DOM.div({className: 'col-sm-1 field no-left-padding'}, cancelbutton));

    displayDiv.insertBefore(row, firstRow);
}

function displayFlightList() {
    let displayDiv = DOM.elid('flightlist');

    let row = displayDiv.appendChild(DOM.div({className:'row', id: 'headRow'}));

    let button = DOM.button({ className: 'btn btn-primary', id: 'addFlight'}, 'add another flight')
    button.addEventListener('click', addFlight);

    row.appendChild(DOM.div({className: 'col-sm-8'}, DOM.h2('List of Flights')));
    row.appendChild(DOM.div({className: 'col-sm-4'}, button));
    displayDiv.appendChild(row);

    row = displayDiv.appendChild(DOM.div({className:'row'}));
    row.appendChild(DOM.div({className: 'col-sm-12'}, DOM.h5('Choose one to get an insurance')));
    displayDiv.appendChild(row);

    let length = flights.length;

    for (let i = 0; i < length; i++) {
        let rowClass = i % 2 == 0 ? 'even' : 'odd';
        row = displayDiv.appendChild(DOM.div({className:'row ' + rowClass}));

        let textinput = DOM.input({ id: 'textinput_' + i, type: 'number', placeholder: 'insurance fee in ETH (max. 1.0 ether)'});

        let button = DOM.button({ id: 'button_' + i, className: 'btn btn-primary buyInsurance'}, 'buy insurance');
        button.setAttribute('data-id', i);
        button.addEventListener('click', buyInsuranceHandler);

        row.appendChild(DOM.div({className: 'col-sm-2 field'}, flights[i].id));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, flights[i].departure.toISOString()));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, textinput));
        row.appendChild(DOM.div({className: 'col-sm-2 field'}, button));
        displayDiv.appendChild(row);
    }

    // DOM.elid('submit-oracle').addEventListener('click', () => {
    //     let flight = DOM.elid('flight-number').value;
    //     // Write transaction
    //     contract.fetchFlightStatus(flight, (error, result) => {
    //         display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp} ]);
    //     });
    // });

    // results.map((result) => {
    //     let row = section.appendChild(DOM.div({className:'row'}));
    //     row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
    //     row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
    //     section.appendChild(row);
    // })

}

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}




