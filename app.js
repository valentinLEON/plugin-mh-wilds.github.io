let isStreamer = true;

// window.Twitch.ext.onAuthorized((auth) => {
//     console.log("Twitch User ID :", auth.userId);

//     if (auth.userId === TWITCH_KEY) {
//         isStreamer = true;
//     }
//     fetchMonsters();
// });

async function fetchMonsters() {
    const { data, error } = await supabase
        .from("Monsters")
        .select("*")
        .order('id_mhwilds', { ascending: true });

    if (error) {
        console.error("Erreur de récupération :", error.message);
        return;
    }
    renderMonsters(data);
}

function renderMonsters(monsters) {
    const list = document.getElementById("checklist-monsters");
    list.innerHTML = "";

    monsters.forEach(monster => {
        // 📌 Création du conteneur principal
        const item = document.createElement("div");
        item.classList.add("flex", "flex-col", "items-center", "gap-3");

        const container = document.createElement("div");
        container.classList.add("flex", "items-center", "justify-center", "gap-4");

        // 📌 Nom du monstre
        const nameElement = document.createElement("p");
        nameElement.classList.add("text-center", "text-lg", "font-semibold", "text-gray-800", "self-center");
        nameElement.textContent = monster.name;

        // Image
        const imageElement = document.createElement("img");
        imageElement.src = "assets/monsters/" + monster.name + ".png";
        imageElement.alt = monster.name;
        imageElement.width = 40;
        imageElement.height = 40;
        imageElement.style.marginRight = "10px";

        // 📌 Icône ✅ (cachée par défaut)
        const checkIcon = document.createElement("div");
        checkIcon.textContent = "✅";
        checkIcon.classList.add("check-icon", "ml-4", "text-green-500", "text-xl", "transition-opacity", "duration-300", "self-center");
        checkIcon.style.opacity = "0";

        const containerCheckboxes = document.createElement("div");
        containerCheckboxes.classList.add("flex", "items-start", "gap-3");

        // 📌 Ajout des checkboxes
        const helm = createCheckbox("helm", "assets/image_sets/helm.jpg", monster);
        const chest = createCheckbox("chest", "assets/image_sets/chest.jpg", monster);
        const legs = createCheckbox("legs", "assets/image_sets/legs.jpg", monster);
        const coil = createCheckbox("coil", "assets/image_sets/coil.jpg", monster);
        const vambraces = createCheckbox("vambraces", "assets/image_sets/vambraces.jpg", monster);
        updateCheckIcon(helm, chest, legs, coil, vambraces, checkIcon); // Vérifier au chargement

        // 📌 Ajout des écouteurs pour mettre à jour l'icône ✅ immédiatement
        if (isStreamer) {
            [helm.checkbox, chest.checkbox, legs.checkbox, coil.checkbox, vambraces.checkbox].forEach(checkbox => {
                checkbox.addEventListener("change", (event) => {
                    updateMonster(event, checkIcon, helm, chest, legs, coil, vambraces); // Sauvegarde l'état
                });
            });
        }

        // 📌 Ajout des éléments dans le container
        item.appendChild(container);
        container.appendChild(imageElement);
        container.appendChild(nameElement);

        item.appendChild(containerCheckboxes);
        containerCheckboxes.appendChild(helm.label);
        containerCheckboxes.appendChild(chest.label);
        containerCheckboxes.appendChild(legs.label);
        containerCheckboxes.appendChild(coil.label);
        containerCheckboxes.appendChild(vambraces.label);
        containerCheckboxes.appendChild(checkIcon);
        list.appendChild(item);
    });
}

// 📌 Fonction pour créer une checkbox avec une image
function createCheckbox(field, imgSrc, monster) {
    const label = document.createElement("label");
    label.classList.add("flex", "flex-col", "items-start", "gap-3", "justify-start");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("h-5", "w-5", "text-green-500", "cursor-pointer", "justify-self-start");
    checkbox.dataset.id = monster.id;
    checkbox.dataset.field = field;
    checkbox.checked = monster[field];
    if (!isStreamer) checkbox.disabled = true;

    const img = document.createElement("img");
    img.src = imgSrc;
    img.alt = field;
    img.width = 30;
    img.height = 30;
    img.classList.add("rounded-lg", "border", "border-gray-300");

    label.appendChild(checkbox);
    label.appendChild(img);

    return { label, checkbox };
}

// Chargement des monstres au démarrage
fetchMonsters();

async function updateMonster(event, checkIcon, helm, chest, legs, coil, vambraces) {
    const field = event.target.dataset.field;
    console.log("field", field);
    const id = event.target.dataset.id;
    const value = event.target.checked;

    updateCheckIcon(helm, chest, legs, coil, vambraces, checkIcon);

    const { error } = await supabase
        .from("Monsters")
        .update({ [field]: value })
        .eq("id", id);
}

// 📌 Vérifie si toutes les cases sont cochées
function updateCheckIcon(helm, chest, legs, coil, vambraces, checkIcon) {
    const allChecked = helm.checkbox.checked && chest.checkbox.checked && legs.checkbox.checked && coil.checkbox.checked && vambraces.checkbox.checked;
    checkIcon.style.opacity = allChecked ? "1" : "0"; // Affichage progressif
}
