'use strict'

const inputCitiesFrom = document.querySelector('.input__cities-from'),
	  dropdownCitiesFrom = document.querySelector('.dropdown__cities-from'),
	  inputCitiesTo = document.querySelector('.input__cities-to'),
	  dropdownCitiesTo = document.querySelector('.dropdown__cities-to'),
	  inputDateDepart = document.querySelector('.input__date-depart'),
	  buttonSearch = document.querySelector('.button__search'),
	  formSearch = document.querySelector('.form-search');

const cheapestTicket = document.getElementById('cheapest-ticket'),
	  otherCheapTickets = document.getElementById('other-cheap-tickets');

let URL = 'cities.json',
	proxy = 'https://cors-anywhere.herokuapp.com/',
	 calendar = 'http://min-prices.aviasales.ru/calendar_preload';

let citiesObj = [];
let cities = []

// Функции

// Получение данных с сервера

const getData = async (url) => {
	let data = await fetch(url)

	return await data.json()
}

getData(URL)
	.then(response => response.forEach(item => {
		citiesObj.push(item)
		if (item.name) {
			cities.push(item.name)
		}
	}))

// Функция для инпутов

const getCities = (input, listCities) => {
	listCities.textContent = '';
	const inputValue = input.value;

	getData(URL)

	if (input.value != '') {
		const filterCity = cities.filter(item => {
			const reg = new RegExp(`${inputValue}`, "i");
			return item.match(reg);
		});
	
		filterCity.forEach(item => {
			const li = document.createElement('li');
			li.classList.add('dropdown__city')
			li.textContent = item;
			listCities.append(li);

			li.addEventListener('click', (e) => {
				const target = e.target;
				input.value = target.textContent;
				listCities.textContent = '';
			})
		})
	}
}

// Функция для формы

const getCheck = (e) => {
	e.preventDefault();

	const checkFrom = citiesObj.find(item => {
		return inputCitiesFrom.value === item.name
	});

	const checkTo = citiesObj.find(item => {
		return inputCitiesTo.value === item.name
	});

	const dataForm = {
		from: checkFrom.code,
		to: checkTo.code,
		date: inputDateDepart.value
	}

	calendar += `?origin=${dataForm.from}`;
	calendar += `&destination=${dataForm.to}`
	calendar += `&depart_date=${dataForm.date}`
	calendar += `&one_way=false`

	getData(calendar)
		.then(response => {

			const chipSitiesYear = response.best_prices.filter(item => item.depart_date === dataForm.date);
			const chipSitiesDays = response.best_prices.filter(item => item.value < 5000);
			const chipSitiesYearTitle = `<h2>Самый дешевый билет на выбранную дату</h2>`;
			const chipSitiesDaysYitle = `<h2>Самые дешевые билеты на другие даты</h2>`;

			const getDate = (date) => {
				return new Date(date).toLocaleDateString('ru', {
					year: "numeric",
					month: "short",
					day: "numeric"
				})
			}

			const chipSitiesYearText = 'На выбранную дату билетов не нашлось!',
				  chipSitiesDaysText = 'Дешевых билетов не нашлось'

			const createCard = (data, selector, title, text) => {

				selector.innerHTML = `<div class="ticket__wrapper">
											<p>${text}</p>
									  </div>`

				if (data != []) {
					console.log(data);
					data.forEach(item => {

						const getLinkTickets = (date) => {
		
							const ticketDate = new Date(date).toLocaleDateString('ru', {
								month: "numeric",
								day: "numeric"
							})

							console.log((ticketDate).replace('.', ''));
							
		
							return (ticketDate).replace('.', '')
						}

						const numberOfChanges = item.number_of_changes == 0 ?
						`Без пересадок` : `Количество пересадок: ${item.number_of_changes}`
	
						const html = `
							<article>
								${title}
								<h3 class="agent">${item.gate}</h3>
								<div class="ticket__wrapper">
									<div class="left-side">
										<a href="https://www.aviasales.ru/search/${item.origin}${getLinkTickets(item.depart_date)}${item.destination}1" target="blanck" class="button button__buy">Купить
											за ${item.value}₽</a>
									</div>
									<div class="right-side">
										<div class="block-left">
											<div class="city__from">Вылет из города
												<span class="city__name">${inputCitiesFrom.value}</span>
											</div>
											<div class="date">${getDate(item.depart_date)}</div>
										</div>
			
										<div class="block-right">
											<div class="changes">${numberOfChanges}</div>
											<div class="city__to">Город назначения:
												<span class="city__name">${inputCitiesTo.value}</span>
											</div>
										</div>
									</div>
								</div>
							</article>
						`;
		
						selector.innerHTML = html;
					})
				} 
			}

			createCard(chipSitiesYear, cheapestTicket, chipSitiesYearTitle, chipSitiesYearText);
			createCard(chipSitiesDays, otherCheapTickets, chipSitiesDaysYitle, chipSitiesDaysText);


		})
}

// Обработчики событий

inputCitiesFrom.addEventListener('input', () => {
	getCities(inputCitiesFrom, dropdownCitiesFrom);
});

inputCitiesTo.addEventListener('input', () => {
	getCities(inputCitiesTo, dropdownCitiesTo);
})

formSearch.addEventListener('submit', getCheck)