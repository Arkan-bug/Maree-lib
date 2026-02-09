// =========================================================================
// ? WEB COMPONENT : DATA-MAREE (Exploitation des donnÃ©es SHOM)
// =========================================================================
// Ce code permet l'affichage dynamique des donnÃ©es marÃ©graphiques publiques.
//
// Â© CrÃ©dits : SHOM (Service Hydrographique et OcÃ©anographique de la Marine)
// Licence : Licence Ouverte / Open Licence (Etalab)
//
// --- CLAUSE DE LIMITATION DE RESPONSABILITÃ‰ ---
// L'utilisateur reconnaÃ®t que l'usage de cet outil se fait Ã  ses propres
// risques et pÃ©rils. L'auteur de ce composant dÃ©cline toute responsabilitÃ©
// en cas d'erreurs, d'omissions, de retards de mise Ã  jour des donnÃ©es
// ou de dÃ©faillances techniques du service source (API SHOM).
// En aucun cas l'auteur ne pourra Ãªtre tenu responsable des dommages
// directs ou indirects (matÃ©riels ou humains) rÃ©sultant de l'interprÃ©tation
// ou de l'utilisation des informations affichÃ©es par ce programme.
//
//                                                        Yrieix MICHAUD
// =========================================================================

const SHOM_CACHE = {
    allPorts: null,
    isLoadingPorts: false
};

class DataMaree extends HTMLElement {
    async connectedCallback() {
        this.portSaisi = this.getAttribute('port');
        this.infoType = this.getAttribute('info') || 'actu';
        this.sources = this.getAttribute('sources') || '1';
        this.refreshRate = parseInt(this.getAttribute('refresh')) || 5;

        this.init();

        // rafraichisement
        if (this.infoType !== "id" && !this.portSaisi.startsWith("-list")) {
            this.refreshInterval = setInterval(() => this.init(), this.refreshRate * 60000);
        }
    }

    disconnectedCallback() {
        // si il n'y a pas de balise, sa ne rafraichi pas la page toute les 5 min
        if (this.refreshInterval) clearInterval(this.refreshInterval);
    }

    async init() {
        try {
            if (!SHOM_CACHE.allPorts) {
                if (!SHOM_CACHE.isLoadingPorts) {
                    SHOM_CACHE.isLoadingPorts = true;
                    const res = await fetch("https://services.data.shom.fr/maregraphie/service/tideGauges");
                    SHOM_CACHE.allPorts = await res.json();
                    SHOM_CACHE.isLoadingPorts = false;
                } else {
                    await new Promise(r => setTimeout(r, 200));
                    return this.init();
                }
            }

            if (this.portSaisi.startsWith("-list")) return this.renderList(this.portSaisi.includes("RONIM"));

            const portFound = SHOM_CACHE.allPorts.find(p =>
                (p.name && p.name.toLowerCase() === this.portSaisi.toLowerCase()) ||
                p.shom_id.toString() === this.portSaisi
            );

            if (!portFound) { this.innerHTML = "Port inconnu"; return; }

            const [resStat, resDetail] = await Promise.all([
                fetch(`https://services.data.shom.fr/maregraphie/stat/${portFound.shom_id}`),
                fetch(`https://services.data.shom.fr/maregraphie/service/completetidegauge/${portFound.shom_id}`)
            ]);
            
            let stats = await resStat.json();
            if (Array.isArray(stats)) stats = stats[0];
            const details = await resDetail.json();

            this.renderUI(portFound.shom_id, stats, details);

        } catch (error) {
            console.error("Erreur DataMaree:", error);
        }
    }

    async renderUI(id, stats, details) {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const baseUrl = `https://services.data.shom.fr/maregraphie/service/chart/maregraphie/${id}/`;
        const params = `?sources=${this.sources}&verticalref=0&timezone=0`;

        if (this.infoType.startsWith("graph")) {
            const url = this.infoType === "graph-direct" 
                ? `${baseUrl}${params}&start=${todayStr}&stop=${todayStr}&t=${Date.now()}`
                : `${baseUrl}${params}&start=${this.getAttribute('start')}&stop=${this.getAttribute('end') || todayStr}`;
            
            this.innerHTML = `<img src="${url}" style="width:100%;">`;
            return;
        }

        let valeur = "N/A";
        if (this.infoType === "actu" && stats.last_date) {
            const isoDate = new Date(stats.last_date).toISOString().split('.')[0];
            const resObs = await fetch(`https://services.data.shom.fr/maregraphie/observation/txt/${id}?sources=${this.sources}&dtStart=${isoDate}&dtEnd=${isoDate}`);
            const obsText = await resObs.text();
            const valLine = obsText.split('\n').find(l => l.includes('/'));
            valeur = valLine ? parseFloat(valLine.split(';')[1].trim()).toFixed(2) + "m" : "N/A";
        } else {
            const dataMap = {
                "id": id,
                "ville": stats.city || "N/A",
                "max_height": details.nphma ? details.nphma + "m" : "N/A",
                "last_date": stats.last_date ? new Date(stats.last_date).toLocaleTimeString('fr-FR') : "N/A"
            };
            valeur = dataMap[this.infoType] || "N/A";
        }

        this.innerHTML = valeur;
    }

    // le rendu

    async renderList(onlyRonim) {
        let ports = SHOM_CACHE.allPorts || [];
        if (onlyRonim) {
            this.innerHTML = "<span>Filtrage RONIM en cours...</span>";
            const results = await Promise.all(ports.map(async p => {
                try {
                    const r = await fetch(`https://services.data.shom.fr/maregraphie/service/completetidegauge/${p.shom_id}`);
                    const d = await r.json();
                    return d.reseau === "RONIM" ? p : null;
                } catch (e) { return null; }
            }));
            ports = results.filter(p => p !== null);
        }

        this.innerHTML = `<ul class="maree-list">
            ${ports.map(p => `<li><strong>${p.name}</strong> (ID: ${p.shom_id})</li>`).join('')}
        </ul>`;
    }

    async renderUI(id, stats, details) {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        let dateDebut = this.startAttr || new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
        let dateFin = this.endAttr || todayStr;

        // URL des graphique
        const baseUrl = `https://services.data.shom.fr/maregraphie/service/chart/maregraphie/${id}/`;
        const params = `?sources=${this.sources}&verticalref=0&timezone=0`;

        if (this.infoType === "graph-direct" || this.infoType === "graph-inter") {
            const finalUrl = this.infoType === "graph-direct" 
                ? `${baseUrl}${params}&start=${todayStr}&stop=${todayStr}`
                : `${baseUrl}${params}&start=${dateDebut}&stop=${dateFin}`;

            const img = new Image();
            img.src = finalUrl;
            img.style.width = "100%";
            img.onload = () => {
                this.innerHTML = "";
                this.appendChild(img);
            };
            img.onerror = () => { this.innerHTML = "Graphique non disponible"; };
            return;
        }

        // pour les donnÃ©e textuel
        let valeur = "N/A";
        switch(this.infoType) {
            case "id": valeur = id; break;
            case "max_height": valeur = details.nphma ? details.nphma + "m" : "N/A"; break;
            case "last_date": valeur = stats.last_date ? new Date(stats.last_date).toLocaleString('fr-FR') : "N/A"; break;
            case "actu":
                if (stats.last_date) {
                    const isoDate = new Date(stats.last_date).toISOString().split('.')[0];
                    const resObs = await fetch(`https://services.data.shom.fr/maregraphie/observation/txt/${id}?sources=${this.sources}&dtStart=${isoDate}&dtEnd=${isoDate}`);
                    const obsText = await resObs.text();
                    const valLine = obsText.split('\n').find(l => l.includes('/'));
                    if (valLine) valeur = parseFloat(valLine.split(';')[1].trim()).toFixed(2) + "m";
                }
                break;
            default: valeur = "Commande inconnue";
        }

        this.innerHTML = valeur;
    }
}

// crÃ©ation de la balise
customElements.define('data-maree', DataMaree);