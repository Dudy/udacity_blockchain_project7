
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';

let flights = [];
let contract;

(async() => {

    contract = new Contract('localhost', () => {
        for (var i = 0; i < getRandomInt(10) + 10; i++) {
            flights.push({ id: 'flight_' + i, departure: randomDate() });
        }

        displayFlightList();
    });
})();

function buyInsuranceHandler() {
    let id = this.getAttribute('data-id');
    let flightnumberText = DOM.elid('flightnumber_' + id);
    let flightnumber = flightnumberText.innerHTML;
    let insuranceFeeTextfield = DOM.elid('textinput_' + id);
    let insurancefee = parseFloat(insuranceFeeTextfield.value);
    let button = DOM.elid('button_' + id);

    if (!insurancefee || insurancefee < 0 || insurancefee > 1) {
        alert('insurance fee must be between 0.0 and 1.0 ETH');
    } else {
        contract.buyInsurance(flightnumber, web3.toWei(insurancefee, 'ether'), (error, result) => {
            if (error) {
                console.log(error);
            } else {
                alert('you successfully bought an insurance for flight ' + flightnumber + ' being worth ' + insurancefee + ' ether');
                insuranceFeeTextfield.readOnly = true;
                button.disabled = true;
            }
        });
    }
}

function updateStatusHandler() {
    let flightnumber = DOM.elid('flightnumber_' + this.getAttribute('data-id')).innerHTML;
    contract.fetchFlightStatus(flightnumber, (error, result) => {
        console.log(error);
        console.log(result);
        // TODO UI update
    });
}

function displayFlightList() {
    let displayDiv = DOM.elid('flightlist');

    displayDiv.appendChild(DOM.h2('List of Flights'));
    displayDiv.appendChild(DOM.h5('Choose one to get an insurance'));

    let length = flights.length;

    for (let i = 0; i < length; i++) {
        let rowClass = i % 2 == 0 ? 'even' : 'odd';
        let row = displayDiv.appendChild(DOM.div({className:'row ' + rowClass}));
        let textinput = DOM.input({ id: 'textinput_' + i, type: 'number', placeholder: 'insurance fee in ETH (max. 1.0)'});
        
        let button = DOM.button({ id: 'button_' + i, className: 'btn btn-primary buyInsurance'}, 'buy insurance');
        button.setAttribute('data-id', i);
        button.addEventListener('click', buyInsuranceHandler);

        let infobutton = DOM.button({ id: 'infobutton_' + i, className: 'btn btn-primary'}, 'update status');
        infobutton.setAttribute('data-id', i);
        infobutton.addEventListener('click', updateStatusHandler);

        row.appendChild(DOM.div({className: 'col-sm-2 field', id: 'flightnumber_' + i}, flights[i].id));
        row.appendChild(DOM.div({className: 'col-sm-3 field'}, flights[i].departure.toISOString()));
        row.appendChild(DOM.div({className: 'col-sm-3 field'}, textinput));
        row.appendChild(DOM.div({className: 'col-sm-2 field'}, button));
        row.appendChild(DOM.div({className: 'col-sm-2 field'}, infobutton));
        displayDiv.appendChild(row);
    }
}

function randomDate(start, end) {
    return new Date(+(new Date()) + Math.floor(Math.random()*1000000000));
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
