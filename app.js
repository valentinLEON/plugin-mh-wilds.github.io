let isStreamer = false;

window.Twitch.ext.onAuthorized((auth) => {
    console.log("Twitch User ID :", auth.userId);

    if (auth.userId === TWITCH_KEY) {
        isStreamer = true;
    }
    fetchMonsters();
});

// // Chargement des monstres au démarrage
fetchMonsters();

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
    console.log("monsters", monsters);
    const list = document.getElementById("checklist-monsters");
    list.innerHTML = "";

    monsters.forEach(monster => {
        const item = document.createElement("div");
        item.classList.add("monster-item");

        // 📌 Conteneur du nom et image
        const container = document.createElement("div");
        container.style.display = "flex";
        container.style.alignItems = "center";
        container.style.gap = "10px";

        // Nom du monstre
        const nameElement = document.createElement("p");
        nameElement.textContent = monster.name;
        nameElement.style.textAlign = "center";
        nameElement.style.fontSize = "18px";
        nameElement.style.fontWeight = "bold";
        nameElement.style.color = "white";

        // Image du monstre
        const imageElement = document.createElement("img");
        imageElement.src = "assets/monsters/" + monster.name + ".png";
        imageElement.alt = monster.name;
        imageElement.width = 40;
        imageElement.height = 40;

        // 📌 Conteneur des checkboxes
        const containerCheckboxes = document.createElement("div");
        containerCheckboxes.style.display = "flex";
        containerCheckboxes.style.alignItems = "flex-start";
        containerCheckboxes.style.gap = "20px";

        // Checkboxes
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = monster.checked;
        checkbox.dataset.id = monster.id;

        const helm = createCheckbox("helm", "assets/image_sets/helm.jpg", monster);
        const chest = createCheckbox("chest", "assets/image_sets/chest.jpg", monster);
        const legs = createCheckbox("legs", "assets/image_sets/legs.jpg", monster);
        const coil = createCheckbox("coil", "assets/image_sets/coil.jpg", monster);
        const vambraces = createCheckbox("vambraces", "assets/image_sets/vambraces.jpg", monster);

        updateMonsterItemBlock(helm, chest, legs, coil, vambraces, item); // Vérifier au chargement

        // Listener when when it's checked
        checkbox.addEventListener("change", async (event) => {
            const checked = event.target.checked;
            await supabase.from("Monsters").update({ checked }).eq("id", monster.id);
            updateMonsterItemBlock(helm, chest, legs, coil, vambraces, item);
        });

        if (isStreamer) {
            [helm.checkbox, chest.checkbox, legs.checkbox, coil.checkbox, vambraces.checkbox].forEach(checkbox => {
                checkbox.addEventListener("change", (event) => {
                    updateMonster(event, helm, chest, legs, coil, vambraces, item); // Sauvegarde l'état
                });
            });
        }

        // 📌 Ajout des éléments dans le DOM
        item.appendChild(container);
        container.appendChild(imageElement);
        container.appendChild(nameElement);

        item.appendChild(containerCheckboxes);
        containerCheckboxes.appendChild(helm.label);
        containerCheckboxes.appendChild(chest.label);
        containerCheckboxes.appendChild(legs.label);
        containerCheckboxes.appendChild(coil.label);
        containerCheckboxes.appendChild(vambraces.label);
        list.appendChild(item);
    });
}

function createCheckbox(field, imgSrc, monster) {
    const label = document.createElement("label");
    label.style.display = "flex";
    label.style.flexDirection = "column";
    label.style.alignItems = "center";
    label.style.gap = "10px";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.style.width = "20px";
    checkbox.style.height = "20px";
    checkbox.style.cursor = "pointer";
    checkbox.dataset.id = monster.id;
    checkbox.dataset.field = field;
    checkbox.checked = monster[field];
    if (!isStreamer) checkbox.disabled = true;

    const img = document.createElement("img");
    img.src = imgSrc;
    img.alt = field;
    img.width = 30;
    img.height = 30;
    img.style.borderRadius = "5px";
    img.style.border = "1px solid #ccc";

    label.appendChild(checkbox);
    label.appendChild(img);

    return { label, checkbox };
}


async function updateMonster(event, helm, chest, legs, coil, vambraces, item) {
    const field = event.target.dataset.field;
    const id = event.target.dataset.id;
    const value = event.target.checked;

    updateMonsterItemBlock(helm, chest, legs, coil, vambraces, item);

    const { error } = await supabase
        .from("Monsters")
        .update({ [field]: value })
        .eq("id", id);
}

// // 📌 Vérifie si toutes les cases sont cochées
function updateMonsterItemBlock(helm, chest, legs, coil, vambraces, item) {
    const allChecked = helm.checkbox.checked && chest.checkbox.checked && legs.checkbox.checked && coil.checkbox.checked && vambraces.checkbox.checked;
    if (isStreamer) {
        console.log("ici");
        [helm.checkbox, chest.checkbox, legs.checkbox, coil.checkbox, vambraces.checkbox].forEach(checkbox => {
            item.style.opacity = allChecked ? "0.25" : "1"; // Affichage progressif
            if (allChecked) checkbox.disabled = true;
        });
    }
}
