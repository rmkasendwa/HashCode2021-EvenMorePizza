const fs = require('fs');
const path = require('path');
const processInput = inputFilePath => {
	console.log(`Processing ${inputFilePath}...`);
	const inputFileContents = fs.readFileSync(inputFilePath, "utf-8");
	const lines = inputFileContents.trim().split('\n');
	const [, noOf2PT, noOf3PT, noOf4PT] = lines.shift().split(' ').map(n => parseInt(n)).map(n => isNaN(n) ? 0 : n);

	// Define Pizza structure
	const availablePizzas = lines.map((line, index) => {
		const [numberOfIngredients, ...ingredients] = line.split(' ');
		return {
			index,
			numberOfIngredients: isNaN(numberOfIngredients) ? ingredients.length : parseInt(numberOfIngredients),
			ingredients: ingredients.sort()
		};
	});

	const findPizza = (teamPizzaIngredients, availablePizzas) => {
		const pizzaWeighting = availablePizzas.map(pizza => {
			return {
				pizza,
				missingIngredients: pizza.ingredients.filter(ingredient => !teamPizzaIngredients.includes(ingredient)).length
			};
		}).sort((a, b) => {
			return b.missingIngredients - a.missingIngredients;
		});
		return pizzaWeighting[0].pizza;
	};
	console.log(`Pizzas to deliver: ${availablePizzas.length}`);
	console.log([
		{ numberOfTeamMembers: 2, teamCount: noOf2PT },
		{ numberOfTeamMembers: 3, teamCount: noOf3PT },
		{ numberOfTeamMembers: 4, teamCount: noOf4PT },
	]);
	// Define available teams
	const pizzasDeliverd = [];
	[
		{ numberOfTeamMembers: 2, teamCount: noOf2PT },
		{ numberOfTeamMembers: 3, teamCount: noOf3PT },
		{ numberOfTeamMembers: 4, teamCount: noOf4PT },
	].forEach(({ numberOfTeamMembers, teamCount }) => {
		const delivered = [];
		Array.from({ length: teamCount }).forEach(() => {
			const teamPizzasDelivered = [];
			if (availablePizzas.length >= numberOfTeamMembers) {
				const teamPizzaIngredients = [];
				Array.from({ length: numberOfTeamMembers }).forEach(() => {
					let pizza = findPizza(teamPizzaIngredients, availablePizzas);
					let newIngrediates = pizza.ingredients.filter(ingredient => !teamPizzaIngredients.includes(ingredient));
					if (newIngrediates.length === 0) {
						const swapTeamCandidateList = [...pizzasDeliverd.reduce((a, b) => [...a, ...b.delivered], []), ...delivered];
						while (newIngrediates.length === 0 && swapTeamCandidateList.length > 0) {
							const swapTeamCandidate = swapTeamCandidateList.shift();
							const visitedTeamIng = swapTeamCandidate.reduce((a, b) => {
								b.ingredients.forEach(d => a.includes(d) || a.push(d));
								return a;
							}, []);
							let missingIngredients = pizza.ingredients.filter(ingredient => !visitedTeamIng.includes(ingredient));
							if (missingIngredients.length > 0) {
								for (let i = 0, j = swapTeamCandidate.length; i < j; i++) {
									if (pizza.ingredients.filter(ingredient => !swapTeamCandidate[i].ingredients.includes(ingredient)).length > 0 && swapTeamCandidate[i].ingredients.filter(ingredient => !teamPizzaIngredients.includes(ingredient)).length > 0) {
										const buffer = swapTeamCandidate[i];
										swapTeamCandidate[i] = pizza;
										pizza = buffer;
										newIngrediates = pizza.ingredients.filter(ingredient => !teamPizzaIngredients.includes(ingredient));
										break;
									}
								}
							}
						}
					}
					availablePizzas.includes(pizza) && availablePizzas.splice(availablePizzas.indexOf(pizza), 1);
					teamPizzaIngredients.push(...newIngrediates);
					teamPizzasDelivered.push(pizza);
				});
			}
			teamPizzasDelivered.length > 0 && delivered.push(teamPizzasDelivered);
		});
		pizzasDeliverd.push({
			numberOfTeamMembers,
			teamCount,
			delivered
		});
	});
	pizzasDeliverd.forEach(deliveryConfig => {
		deliveryConfig.delivered.forEach(team => {
			team.sort((a, b) => a.index - b.index);
		});
	});
	const exportData = [
		pizzasDeliverd.reduce((accumulator, deliveryConfig) => {
			return accumulator + deliveryConfig.delivered.length;
		}, 0),
		...pizzasDeliverd.filter(deliveryConfig => deliveryConfig.delivered.length > 0).reduce((accumulator, deliveryConfig) => {
			deliveryConfig.delivered.forEach(teams => {
				accumulator.push([
					deliveryConfig.numberOfTeamMembers,
					...teams.map(pizza => pizza.index)
				].join(' '));
			});
			return accumulator;
		}, [])
	].join('\n');

	fs.writeFileSync(`output-dir/${path.basename(inputFilePath)}_Output.txt`, exportData);
	// console.log('Input');
	// console.log(fs.readFileSync(inputFilePath, "utf-8"));
	// console.log('\nOutput');
	// console.log(exportData);
};
processInput('a_example');
processInput('b_little_bit_of_everything.in');
// fs.readdirSync('.').filter(obj => obj.match(/\.in$/g)).forEach(inputFileName => processInput(inputFileName));