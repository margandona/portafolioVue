class Player {
    constructor() {
        this.ghostPetz = [];
        this.currentPetIndex = 0;
        this.inventory = [];
    }

    addGhostPet(ghostPet) {
        if (this.ghostPetz.length < 6) {
            this.ghostPetz.push(ghostPet);
            this.updatePetButtons();
        } else {
            alert('Ya tienes el máximo de 6 GhostPetz.');
        }
    }

    switchPet(index) {
        if (index >= 0 && index < this.ghostPetz.length) {
            this.currentPetIndex = index;
            this.ghostPetz[this.currentPetIndex].updateStats();
        }
    }

    updatePetButtons() {
        $('#pet-buttons').empty();
        this.ghostPetz.forEach((pet, index) => {
            $('#pet-buttons').append(`<button class="btn btn-secondary mx-2" onclick="player.switchPet(${index})">${pet.type} ${index + 1}</button>`);
        });
    }

    updateInventory() {
        $('#inventory-items').text(this.inventory.join(', '));
    }

    addItemToInventory(item) {
        this.inventory.push(item);
        this.updateInventory();
    }
}

class GhostPet {
    constructor(type) {
        this.type = type;
        this.level = 1;
        this.xp = 0;
        this.xpToNextLevel = 100;
        this.health = 100;
        this.energy = 100;
        this.happiness = 100;
        this.age = 0;
        this.illness = false;
        this.emotions = 'neutral';
        this.knowledge = 0;
        this.skills = 0;
    }

    updateStats() {
        $('#pet-type').text('Tipo: ' + this.type);
        $('#pet-level').text('Nivel: ' + this.level);
        $('#pet-xp').text('XP: ' + this.xp + '/' + this.xpToNextLevel);
        $('#pet-health').text('Salud: ' + this.health);
        $('#pet-energy').text('Energía: ' + this.energy);
        $('#pet-happiness').text('Felicidad: ' + this.happiness);
        $('#pet-age').text('Edad: ' + this.age);
        $('#pet-illness').text('Enfermedad: ' + (this.illness ? 'Sí' : 'No'));
        $('#pet-emotions').text('Emociones: ' + this.emotions);
    }

    gainXP(amount) {
        this.xp += amount;
        if (this.xp >= this.xpToNextLevel) {
            this.levelUp();
        }
        this.updateStats();
    }

    levelUp() {
        this.level++;
        this.xp -= this.xpToNextLevel;
        this.xpToNextLevel = Math.round(this.xpToNextLevel * 1.5);
        this.health += 20;
        this.energy += 20;
        this.happiness += 10;
        alert('¡Tu GhostPet ha subido al nivel ' + this.level + '!');
        this.updateStats();
    }

    performActivity(activity) {
        switch(activity) {
            case 'alimentar':
                this.energy += 10;
                this.happiness += 5;
                this.gainXP(10);
                break;
            case 'estudiar':
                this.energy -= 10;
                this.happiness += 10;
                this.knowledge += 5;
                this.gainXP(15);
                break;
            case 'trabajar':
                this.energy -= 20;
                this.happiness -= 5;
                this.health += 10;
                this.gainXP(20);
                break;
            case 'ejercicio':
                this.health += 15;
                this.energy -= 10;
                this.happiness += 5;
                this.gainXP(10);
                break;
            case 'meditar':
                this.energy += 10;
                this.happiness += 10;
                this.gainXP(5);
                break;
            case 'socializar':
                this.happiness += 15;
                this.energy -= 5;
                this.gainXP(10);
                break;
            case 'entrenamiento':
                this.skills += 10;
                this.energy -= 15;
                this.happiness -= 5;
                this.gainXP(20);
                break;
        }
        this.updateStats();
        this.checkRandomEvent();
    }

    startMission(mission) {
        switch(mission) {
            case 'vencerCriaturas':
                this.health -= 10;
                this.skills += 15;
                this.happiness += 10;
                this.gainXP(30);
                break;
            case 'resolverPuzles':
                this.knowledge += 20;
                this.energy -= 10;
                this.happiness += 5;
                this.gainXP(25);
                break;
            case 'desafiosConocimiento':
                this.knowledge += 25;
                this.energy -= 15;
                this.gainXP(35);
                break;
            case 'busquedaTesoros':
                this.happiness += 20;
                this.energy -= 10;
                this.skills += 10;
                this.gainXP(20);
                break;
        }
        this.updateStats();
        this.checkRandomEvent();
    }

    checkRandomEvent() {
        const randomEvent = Math.random();
        if (randomEvent < 0.1) {
            this.illness = true;
            this.health -= 20;
            alert('Tu GhostPet se ha enfermado.');
        } else if (randomEvent < 0.2) {
            const item = this.findRandomItem();
            player.addItemToInventory(item);
            alert('¡Has encontrado un objeto: ' + item + '!');
        }
    }

    findRandomItem() {
        const items = ['Comida', 'Medicina', 'Artefacto'];
        return items[Math.floor(Math.random() * items.length)];
    }
}

let player = new Player();

function selectPet(type) {
    const ghostPet = new GhostPet(type);
    player.addGhostPet(ghostPet);
    player.switchPet(player.ghostPetz.length - 1);
    $('#pet-selection').hide();
    $('#pet-status').show();
    $('#missions').show();
    $('#inventory').show();
    $('#explore').show();
    $('#switch-pet').show();
}

function performActivity(activity) {
    player.ghostPetz[player.currentPetIndex].performActivity(activity);
}

function startMission(mission) {
    player.ghostPetz[player.currentPetIndex].startMission(mission);
}

function exploreArea(area) {
    alert('Explorando ' + area);
    player.ghostPetz[player.currentPetIndex].gainXP(15);
}
