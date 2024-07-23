class Player {
    constructor() {
        this.ghostPetz = [];
        this.currentPetIndex = 0;
        this.inventory = [];
        this.coins = 0;
        this.missionHistory = [];
        this.loadProgress();
    }

    addGhostPet(ghostPet) {
        if (this.ghostPetz.length < 6) {
            this.ghostPetz.push(ghostPet);
            this.updatePetButtons();
            this.mostrarMensaje(`Has añadido un nuevo ${ghostPet.type} a tu colección.`, 'info');
            this.saveProgress();
        } else {
            this.mostrarMensaje('Ya tienes el máximo de 6 GhostPetz.', 'warning');
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
            $('#pet-buttons').append(`<button class="btn btn-secondary mx-2 mb-2" onclick="player.switchPet(${index})"><i class="fas fa-paw"></i> ${pet.type} ${index + 1}</button>`);
        });
    }

    updateInventory() {
        $('#inventory-items').empty();
        this.inventory.forEach((item, index) => {
            $('#inventory-items').append(
                `<div class="inventory-item">
                    ${item.name} - ${item.type} 
                    <button class="btn btn-success btn-sm" onclick="player.useItem(${index})"><i class="fas fa-check"></i> Usar</button>
                    <button class="btn btn-danger btn-sm" onclick="player.sellItem(${index})"><i class="fas fa-trash-alt"></i> Vender</button>
                </div>`
            );
        });
    }

    addItemToInventory(item) {
        this.inventory.push(item);
        this.updateInventory();
        this.mostrarMensaje(`¡Has encontrado un objeto: ${item.name}!`, 'success');
        this.saveProgress();
    }

    useItem(index) {
        const item = this.inventory[index];
        this.ghostPetz[this.currentPetIndex].applyItem(item);
        this.inventory.splice(index, 1);
        this.updateInventory();
        this.mostrarMensaje(`Has usado ${item.name} en tu GhostPet.`, 'info');
        this.saveProgress();
    }

    sellItem(index) {
        const item = this.inventory[index];
        this.coins += item.value;
        this.inventory.splice(index, 1);
        this.updateInventory();
        this.updateCoins();
        this.mostrarMensaje(`Has vendido ${item.name} por ${item.value} monedas.`, 'info');
        this.saveProgress();
    }

    updateCoins() {
        $('#coins').text('Monedas: ' + this.coins);
    }

    mostrarMensaje(mensaje, estado) {
        $('#messages').append(`<p>${estado.toUpperCase()}: ${mensaje}</p>`).hide().fadeIn(1000);
    }

    buyPet(type) {
        let cost = 0;
        switch(type) {
            case 'fantasma':
                cost = 100;
                break;
            case 'espectro':
                cost = 200;
                break;
            case 'wraith':
                cost = 300;
                break;
        }
        if (this.coins >= cost) {
            this.coins -= cost;
            const ghostPet = new GhostPet(type);
            this.addGhostPet(ghostPet);
            this.updateCoins();
            this.mostrarMensaje(`Has comprado un ${type} por ${cost} monedas.`, 'success');
            this.saveProgress();
        } else {
            this.mostrarMensaje('No tienes suficientes monedas para comprar este GhostPet.', 'danger');
        }
    }

    addMissionToHistory(mission) {
        this.missionHistory.push(mission);
        this.updateMissionHistory();
        this.saveProgress();
    }

    updateMissionHistory() {
        $('#mission-history-items').empty();
        this.missionHistory.forEach((mission, index) => {
            $('#mission-history-items').append(
                `<div class="mission-history-item">
                    ${mission.description} - Recompensas: ${mission.rewards.join(', ')}
                </div>`
            );
        });
    }

    saveProgress() {
        const progress = {
            ghostPetz: this.ghostPetz.map(pet => pet.serialize()),
            currentPetIndex: this.currentPetIndex,
            inventory: this.inventory,
            coins: this.coins,
            missionHistory: this.missionHistory
        };
        localStorage.setItem('ghostPetzProgress', JSON.stringify(progress));
    }

    loadProgress() {
        const progress = JSON.parse(localStorage.getItem('ghostPetzProgress'));
        if (progress) {
            this.coins = progress.coins;
            this.inventory = progress.inventory;
            this.missionHistory = progress.missionHistory;
            this.currentPetIndex = progress.currentPetIndex;
            progress.ghostPetz.forEach(petData => {
                const pet = new GhostPet(petData.type);
                pet.deserialize(petData);
                this.ghostPetz.push(pet);
            });
            this.updateCoins();
            this.updateInventory();
            this.updateMissionHistory();
            this.updatePetButtons();
            if (this.ghostPetz.length > 0) {
                this.ghostPetz[this.currentPetIndex].updateStats();
            }
        }
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
        this.bathing = false;

        this.increaseAge();
        this.updateImage();
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

        $('#progress-health').css('width', this.health + '%').hide().fadeIn(1000);
        $('#progress-energy').css('width', this.energy + '%').hide().fadeIn(1000);
        $('#progress-happiness').css('width', this.happiness + '%').hide().fadeIn(1000);

        this.updateImage();
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
        player.mostrarMensaje(`¡Tu GhostPet ha subido al nivel ${this.level}!`, 'success');
        this.updateStats();
        player.saveProgress();
    }

    updateImage() {
        let imagePath = '';
        if (this.type === 'fantasma') {
            if (this.level < 3) {
                imagePath = 'img/fantasma1.png';
            } else if (this.level < 6) {
                imagePath = 'img/fantasma2.png';
            } else {
                imagePath = 'img/fantasma3.png';
            }
        } else if (this.type === 'espectro') {
            if (this.level < 3) {
                imagePath = 'img/espectro1.png';
            } else if (this.level < 6) {
                imagePath = 'img/espectro2.png';
            } else {
                imagePath = 'img/espectro3.png';
            }
        } else if (this.type === 'wraith') {
            if (this.level < 3) {
                imagePath = 'img/wraith1.png';
            } else if (this.level < 6) {
                imagePath = 'img/wraith2.png';
            } else {
                imagePath = 'img/wraith3.png';
            }
        }
        $('#pet-image').attr('src', imagePath).hide().fadeIn(1000);
    }

    performActivity(activity) {
        if (this.illness && (activity === 'jugar' || activity === 'estudiar')) {
            player.mostrarMensaje('Tu GhostPet está enfermo y no puede realizar esta actividad.', 'warning');
            return;
        }

        if (this.energy <= 0 && activity !== 'descansar') {
            player.mostrarMensaje('Tu GhostPet está cansado y necesita descansar.', 'warning');
            return;
        }

        switch(activity) {
            case 'alimentar':
                this.energy += 10;
                this.happiness += 5;
                this.gainXP(10);
                break;
            case 'estudiar':
                if (this.energy >= 10) {
                    this.energy -= 10;
                    this.happiness += 10;
                    this.knowledge += 5;
                    this.gainXP(15);
                } else {
                    player.mostrarMensaje('Tu GhostPet no tiene suficiente energía para estudiar.', 'warning');
                    return;
                }
                break;
            case 'trabajar':
                if (this.energy >= 20) {
                    this.energy -= 20;
                    this.happiness -= 5;
                    this.health += 10;
                    this.gainXP(20);
                } else {
                    player.mostrarMensaje('Tu GhostPet no tiene suficiente energía para trabajar.', 'warning');
                    return;
                }
                break;
            case 'ejercicio':
                if (this.energy >= 10) {
                    this.health += 15;
                    this.energy -= 10;
                    this.happiness += 5;
                    this.gainXP(10);
                } else {
                    player.mostrarMensaje('Tu GhostPet no tiene suficiente energía para hacer ejercicio.', 'warning');
                    return;
                }
                break;
            case 'meditar':
                this.energy += 10;
                this.happiness += 10;
                this.gainXP(5);
                break;
            case 'socializar':
                if (this.energy >= 5) {
                    this.happiness += 15;
                    this.energy -= 5;
                    this.gainXP(10);
                } else {
                    player.mostrarMensaje('Tu GhostPet no tiene suficiente energía para socializar.', 'warning');
                    return;
                }
                break;
            case 'entrenamiento':
                if (this.energy >= 15) {
                    this.skills += 10;
                    this.energy -= 15;
                    this.happiness -= 5;
                    this.gainXP(20);
                } else {
                    player.mostrarMensaje('Tu GhostPet no tiene suficiente energía para entrenar.', 'warning');
                    return;
                }
                break;
            case 'baño':
                this.bathing = true;
                this.health += 10;
                this.happiness += 10;
                this.gainXP(5);
                setTimeout(() => { this.bathing = false; }, 5000); // 5 seconds bath time
                break;
            case 'descansar':
                this.energy += 20;
                this.happiness += 5;
                break;
        }
        this.updateStats();
        this.checkRandomEvent();
        player.saveProgress();
    }

    startMission(mission) {
        let rewards = [];
        switch(mission) {
            case 'vencerCriaturas':
                if (this.health >= 10) {
                    this.health -= 10;
                    this.skills += 15;
                    this.happiness += 10;
                    this.gainXP(30);
                    player.coins += 50;
                    rewards = ['50 monedas'];
                    player.mostrarMensaje('Tu GhostPet ha vencido criaturas malignas y ha ganado 50 monedas.', 'info');
                } else {
                    player.mostrarMensaje('Tu GhostPet no tiene suficiente salud para vencer criaturas.', 'warning');
                    return;
                }
                break;
            case 'resolverPuzles':
                if (this.energy >= 10) {
                    this.knowledge += 20;
                    this.energy -= 10;
                    this.happiness += 5;
                    this.gainXP(25);
                    player.coins += 30;
                    rewards = ['30 monedas'];
                    player.mostrarMensaje('Tu GhostPet ha resuelto un puzle y ha ganado 30 monedas.', 'info');
                } else {
                    player.mostrarMensaje('Tu GhostPet no tiene suficiente energía para resolver puzles.', 'warning');
                    return;
                }
                break;
            case 'desafiosConocimiento':
                if (this.energy >= 15) {
                    this.knowledge += 25;
                    this.energy -= 15;
                    this.gainXP(35);
                    player.coins += 40;
                    rewards = ['40 monedas'];
                    player.mostrarMensaje('Tu GhostPet ha completado un desafío de conocimiento y ha ganado 40 monedas.', 'info');
                } else {
                    player.mostrarMensaje('Tu GhostPet no tiene suficiente energía para completar desafíos de conocimiento.', 'warning');
                    return;
                }
                break;
            case 'busquedaTesoros':
                if (this.energy >= 10) {
                    this.happiness += 20;
                    this.energy -= 10;
                    this.skills += 10;
                    this.gainXP(20);
                    player.coins += 20;
                    rewards = ['20 monedas'];
                    player.mostrarMensaje('Tu GhostPet ha encontrado un tesoro y ha ganado 20 monedas.', 'info');
                } else {
                    player.mostrarMensaje('Tu GhostPet no tiene suficiente energía para buscar tesoros.', 'warning');
                    return;
                }
                break;
        }
        player.updateCoins();
        player.addMissionToHistory({ description: `Misión: ${mission}`, rewards: rewards });
        this.updateStats();
        this.checkRandomEvent();
        player.saveProgress();
    }

    checkRandomEvent() {
        const randomEvent = Math.random();
        if (randomEvent < 0.1) {
            this.illness = true;
            this.health -= 20;
            player.mostrarMensaje('Tu GhostPet se ha enfermado.', 'warning');
        } else if (randomEvent < 0.2) {
            const item = this.findRandomItem();
            player.addItemToInventory(item);
        }
    }

    findRandomItem() {
        const items = [
            { name: 'Comida', type: 'comida', value: 10, effect: { health: 10, energy: 10, happiness: 10 } },
            { name: 'Medicina', type: 'medicina', value: 20, effect: { health: 20 } },
            { name: 'Juguete', type: 'juguete', value: 15, effect: { happiness: 20 } },
            { name: 'Arma', type: 'arma', value: 30, effect: { skills: 10 } },
            { name: 'Herramienta', type: 'herramienta', value: 25, effect: { knowledge: 10 } }
        ];
        return items[Math.floor(Math.random() * items.length)];
    }

    applyItem(item) {
        if (item.effect.health) this.health += item.effect.health;
        if (item.effect.energy) this.energy += item.effect.energy;
        if (item.effect.happiness) this.happiness += item.effect.happiness;
        if (item.effect.skills) this.skills += item.effect.skills;
        if (item.effect.knowledge) this.knowledge += item.effect.knowledge;
        this.updateStats();
        player.mostrarMensaje(`Has usado ${item.name} en tu GhostPet.`, 'info');
        player.saveProgress();
    }

    increaseAge() {
        setInterval(() => {
            this.age++;
            player.mostrarMensaje(`¡Tu GhostPet ha cumplido ${this.age} años!`, 'info');
            this.updateStats();
            player.saveProgress();
        }, 60000); // Cada 60 segundos
    }

    serialize() {
        return {
            type: this.type,
            level: this.level,
            xp: this.xp,
            xpToNextLevel: this.xpToNextLevel,
            health: this.health,
            energy: this.energy,
            happiness: this.happiness,
            age: this.age,
            illness: this.illness,
            emotions: this.emotions,
            knowledge: this.knowledge,
            skills: this.skills,
            bathing: this.bathing
        };
    }

    deserialize(data) {
        this.level = data.level;
        this.xp = data.xp;
        this.xpToNextLevel = data.xpToNextLevel;
        this.health = data.health;
        this.energy = data.energy;
        this.happiness = data.happiness;
        this.age = data.age;
        this.illness = data.illness;
        this.emotions = data.emotions;
        this.knowledge = data.knowledge;
        this.skills = data.skills;
        this.bathing = data.bathing;
        this.updateImage();
        this.updateStats();
    }
}

document.addEventListener("DOMContentLoaded", function() {
    window.player = new Player(); // Esto automáticamente carga el progreso.
});

function selectPet(type) {
    const ghostPet = new GhostPet(type);
    player.addGhostPet(ghostPet);
    player.switchPet(player.ghostPetz.length - 1);
    $('#pet-selection').hide();
    $('#pet-status-card').show();
    $('#activities-card').show();
    $('#missions-card').show();
    $('#inventory-card').show();
    $('#coins-card').show();
    $('#explore-card').show();
    $('#switch-pet-card').show();
    $('#buy-pet-card').show();
    $('#missions-history-card').show();
    $('#messages-container-card').show();
}

function performActivity(activity) {
    player.ghostPetz[player.currentPetIndex].performActivity(activity);
}

function startMission(mission) {
    player.ghostPetz[player.currentPetIndex].startMission(mission);
}

function exploreArea(area) {
    player.mostrarMensaje(`Explorando ${area}`, 'info');
    player.ghostPetz[player.currentPetIndex].gainXP(15);
}

function buyPet(type) {
    player.buyPet(type);
}
