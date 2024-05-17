let heures = null;

// Fonction pour effectuer la requête AJAX à OpenWeather
async function buttonClickGET() {
    try {
        let zone = document.getElementById("zone").value; // Récupérer la zone du spot
        let meteoUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + zone + "&appid=c21a75b667d6f7abb81f118dcf8d4611&units=metric"; //Envoyer la requète HTTP

        // Requête Fetch pour obtenir les données sur la météo depuis l'API OpenWeatherMap
        let response = await fetch(meteoUrl);
        
        if (!response.ok) {
            throw new Error('Erreur lors de la requête AJAX.');
        }

        let data = await response.json();

        // Utiliser Promise.all() pour exécuter la fonction de callback deux fois
        await Promise.all([callBackGetSuccess(data), callBackGetSuccess(data)]);
    } catch (error) {
        console.error('Erreur lors de la requête AJAX :', error); // Afficher une erreur en cas d'échec de la requête
    }
}

// Callback en cas de réussite de la requête
function callBackGetSuccess(data) {
    console.log("Données de l'API:", data);

    // Températures et vent
    afficherMeteo(data);

    // Afficher SVG selon le temps
    afficherImage(data);

    // Afficher l'heure
    afficherHeure(data);
    
}



// Afficher l'image correspondant à la météo
function afficherImage(data) {
    let cheminImage = obtenirCheminImage(data.weather[0].main);
    let iconeMeteo = document.getElementById("iconeMeteo");
    iconeMeteo.innerHTML = "<img src='" + cheminImage + "' alt='Icone météo'>";
}



// Afficher l'heure locale en fonction du décalage horaire de la zone
function afficherHeure(data) {
    let heure = document.getElementById("heure");
    let decalageHoraire = data.timezone; // OBTENIR DECALAGE HORAIRE
    let heureActuelle = new Date(); 
    let heureNouvelleZone = new Date(heureActuelle.getTime() + decalageHoraire * 1000); // CALCUL L'HEURE DANS LA ZONE

    let joursSemaine = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
    let moisNoms = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

    let jourSemaine = joursSemaine[heureNouvelleZone.getDay()];
    let jourMois = heureNouvelleZone.getDate();
    let mois = moisNoms[heureNouvelleZone.getMonth()];
    heures = (heureNouvelleZone.getHours()-1);
    let minutes = heureNouvelleZone.getMinutes();

    // AFFICHER HEURE, MINUTE ET SECONDE EN DEUX CHIFFRES? EXEMPLE 10h04 ET PAS 10h4
    heures = (heures < 10) ? "0" + heures : heures;
    minutes = (minutes < 10) ? "0" + minutes : minutes;

    heure.innerHTML = jourSemaine + " " + jourMois + " " + mois + " " + heures + "h" + minutes;

    

    // Appeler la fonction pour changer la couleur de fond uniquement lorsque l'heure est mise à jour
    changerFond(heureNouvelleZone.getHours());
}

// Modifier la couleur de l'arrière-plan en fonction de l'heure
function changerFond(heureNouvelleZone) {
    // Définir la couleur de fond en fonction de l'heure
    if (heureNouvelleZone < 6 || heureNouvelleZone >= 20) {
        // Nuit
        document.body.style.background = "linear-gradient(blue, pink)";
        

    } else if (heureNouvelleZone >= 6 && heureNouvelleZone < 20) {
        // Journée
        document.body.style.background = "linear-gradient(to bottom, #87CEEB, #FFC0CB)";
    }
    
}


// Afficher les informations sur la météo
function afficherMeteo(data) {
    let temperatureVent = document.getElementById("meteo");
    let temperature = data.main.temp;
    let vent = data.wind.speed * 3.6; // Pour convertir la vitesse du vent de m/s à km/h
    temperatureVent.innerHTML = "Température : " + temperature + " °<br>Vent : " + vent.toFixed(2) + " km/h"; //toFixed(2) sert à n'affiche que deux décimales

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    // Définir la largeur et la hauteur du canvas
    const width = canvas.width = window.innerWidth;
    const height = canvas.height = window.innerHeight;
    
    // Définir les variables pour la vague
    let xOffset = 0;
    
    // Fonction pour dessiner la vague
    function dessinerVagues(xOffset, color) {
        const gradient = ctx.createLinearGradient(0, 0, 0, height); // Créer un gradient vertical
        gradient.addColorStop(0, '#ddf3ff'); // Bleu clair en haut
        gradient.addColorStop(1, color); // Couleur spécifiée en bas
    
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x < width; x += 1) { //Trou à droite ( àcombler)
            const y = height / 2 + Math.sin(x / 200 + xOffset) * (temperature*4); //Hauteur
            const z = Math.cos(x /100 + xOffset) * 30; // Ondulations
            ctx.lineTo(x, y - z);
    
        
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
    }
    
    // Fonction pour animer la vague
    function animerVagues() {
        requestAnimationFrame(animerVagues);
        ctx.clearRect(0, 0, width, height);
    
        // Dessiner les trois parties de la vague avec des couleurs différentes
        dessinerVagues(xOffset+500, "#ffffff",0); // Blanc
        dessinerVagues(xOffset+100 , "#87ceeb",0); // Bleu clair
        dessinerVagues(xOffset-100 , "#1e90ff", ); // Bleu foncé
    
        xOffset += (0.004 * vent); // Vitesse des vagues
    }
    
    animerVagues();
}

function obtenirCheminImage(conditionMeteo) {
    console.log(heures);
    if (heures < 6 || heures >= 20) {
        switch (conditionMeteo) {
            case "Clear":
                return "img/moon.svg";
            case "Clouds":
                return "img/moon_clouds.svg";
            case "Rain":
                return "img/moon_rain.svg";
            case "Thunderstorm":
                return "img/moon_storm.svg";
            case "Snow":
                return "img/moon_snow.svg";
            case "Mist":
                return "img/moon_mist.svg";
            default:
                return "img/moon_clouds.svg"; 
        }
    } else {
        switch (conditionMeteo) {
            case "Clear":
                return "img/sun.svg";
            case "Clouds":
                return "img/clouds.svg";
            case "Rain":
                return "img/rain.svg";
            case "Thunderstorm":
                return "img/storm.svg";
            case "Snow":
                return "img/snow.svg";
            case "Mist":
                return "img/mist.svg";
            default:
                return "img/clouds.svg";
        }
    }
}

setInterval(buttonClickGET, 60000);






