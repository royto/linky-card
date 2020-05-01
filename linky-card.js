//import 'https://unpkg.com/@google-web-components/google-chart/google-chart.js?module';

class LinkyCard extends HTMLElement {
  set hass(hass) {
    const entityId = this.config.entity;
    const state = hass.states[entityId];
    const stateStr = state ? state.state : 'unavailable';
    const attributes = state.attributes;
    
    if (!this.content) {
      const card = document.createElement('ha-card');
      const style = document.createElement('style');
      style.textContent = `
      .clear {
        clear: both;
      }
    
      .card {
        margin: auto;
        padding-top: 2em;
        padding-bottom: 1em;
        padding-left: 1em;
        padding-right:1em;
        position: relative;
      }
    
      .ha-icon {
        height: 18px;
        margin-right: 5px;
        color: var(--paper-item-icon-color);
      }
      
      .hp-hc-block {
        float: left;
        text-align: right;
      }
      
      .cout-block {
        float: left;
      }
      
      .icon-block {
        float: left;
      }

      .cout {
        font-weight: 300;
        font-size: 4em;
        color: var(--primary-text-color);
        position: absolute;
        right: 0.8em;
      }
    
      .cout-unit {
        font-weight: 300;
        font-size: 1.5em;
        vertical-align: super;
        color: var(--primary-text-color);
        position: absolute;
        right: 1em;
        margin-top: -14px;
        margin-right: 7px;
      }
    
      .conso-hp {
        font-weight: 200;
        font-size: 2em;
        color: var(--primary-text-color);
      }
    
      .conso-hc {
        font-weight: 200;
        font-size: 2em;
        color: var(--primary-text-color);
      }
    
      .conso-unit-hc {
        font-weight: 100;
        font-size: 1em;
        vertical-align: super;
        color: var(--primary-text-color);
        margin-top: -14px;
        margin-right: 7px;
      }
    
      .conso-unit-hp {
        font-weight: 100;
        font-size: 1em;
        vertical-align: super;
        color: var(--primary-text-color);
        margin-top: -14px;
        margin-right: 7px;
      }
      
      .more-unit {
        font-style: italic;
        font-size: 0.8em;
      }
    
      .variations-linky {
        display: inline-block;
        font-weight: 300;
        color: var(--primary-text-color);
        list-style: none;
        margin-left: -2em;
      }
    
      .variations-linky.right {
        position: absolute;
        right: 1em;
        margin-left: 0;
        margin-right: 1em;
      }
    
      .unit {
        font-size: .8em;
      }
    
      .week-history {
        width: 100%;
        margin: 0 auto;
        height: 4em;
      }
    
      .day {
        display: block;
        width: 20%;
        float: left;
        text-align: center;
        color: var(--primary-text-color);
        border-right: .1em solid #d9d9d9;
        line-height: 2;
        box-sizing: border-box;
      }
    
      .dayname {
        text-transform: uppercase;
      }
    
      .week-history .day:first-child {
        margin-left: 0;
      }
    
      .week-history .day:nth-last-child(1) {
        border-right: none;
        margin-right: 0;
      }
    
      .cons-val {
        font-weight: bold;
      }
    
      .linky-icon.bigger {
        width: 6em;
        height: 5em;
        margin-top: -1em;
        margin-left: 2em;
      }
    
      .linky-icon {
        width: 50px;
        height: 50px;
        margin-right: 5px;
        display: inline-block;
        vertical-align: middle;
        background-size: contain;
        background-position: center center;
        background-repeat: no-repeat;
        text-indent: -9999px;
      }
      
      .previous-month {
        font-size: 0.8em;
        font-style: italic;
        margin-left: 5px;
      }
      `;
      card.appendChild(style);
      this.content = document.createElement('div');
      this.content.className = 'card';
      card.appendChild(this.content);
      if (stateStr == 'unavailable') {
          this.content.innerHTML = `
            <div id="states">
            <div class="name">
              <ha-icon id="icon" icon="mdi:flash" data-state="unavailable" data-domain="connection" style="color: var(--state-icon-unavailable-color)"></ha-icon>
              <span style="margin-right:2em">Linky : Site Enedis.fr inaccessible</span>
            </div>
            </div>`
      }
      this.appendChild(card);
    }
    

    if (stateStr != 'unavailable') {
      this.content.innerHTML = `
        <div class="hp-hc-block">
          <google-chart
            type='pie'
            options='{"title": "${this.config.title}", "pieHole": 0.6}'
            cols='[{"label":"Heures", "type":"string"}, {"label":"Consomation", "type":"number"}]'
            rows='[["Pleines", ${Number.parseFloat(attributes.peak_hours).toFixed(1)}],["Creuse", ${Number.parseFloat(attributes.offpeak_hours).toFixed(1)}]]'>
          </google-chart>
          <span class="conso-hc">${Number.parseFloat(attributes.offpeak_hours).toFixed(1)}</span><span class="conso-unit-hc"> ${attributes.unit_of_measurement} <span class="more-unit">(en HC)</span></span><br />
          <span class="conso-hp">${Number.parseFloat(attributes.peak_hours).toFixed(1)}</span><span class="conso-unit-hp"> ${attributes.unit_of_measurement} <span class="more-unit">(en HP)</span></span>
        </div>
        <div class="cout-block">
          <span class="cout" title="Coût journalier">${Number.parseFloat(attributes.daily_cost).toFixed(2)}</span><span class="cout-unit"> €</span><!--FIXME: From yaml config or glabal setting--!>
        </div>
        <div class="clear"></div>
        <span>
          <ul class="variations-linky right">
              <li><span class="ha-icon"><ha-icon icon="mdi:flash"></ha-icon></span>${Math.round(attributes.peak_offpeak_percent)}<span class="unit"> % HP</span></li>
          </ul>
          <ul class="variations-linky">
              <li><span class="ha-icon"><ha-icon icon="mdi:arrow-right" style="transform: rotate(${(attributes.monthly_evolution < 0) ? '45' : ((attributes.monthly_evolution == 0) ? "0" : "-45")}deg)"></ha-icon></span>${Math.round(attributes.monthly_evolution)}<span class="unit"> %</span><span class="previous-month">par rapport à ${new Date((new Date().getTime()) - 365*60*60*24*1000).toLocaleDateString('fr-FR', {month: "long", year: "numeric"})}</span></li>
          </ul>
        </span>
        <div class="week-history clear">
            ${Object.keys(attributes.daily.slice(2, 7).reverse()).map((day, index) => `
            <div class="day">
                <span class="dayname">${new Date(new Date().setDate(new Date().getDate()-(6-Number.parseInt(day)))).toLocaleDateString('fr-FR', {weekday: "long"}).split(' ')[0]}</span>
                <br><span class="cons-val">${Number.parseFloat(attributes.daily.slice(2, 7).reverse()[day]).toFixed(1)} ${attributes.unit_of_measurement}</span>
            </div>`).join('')}
        </div>`;
    }
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define an entity');
    }
    this.config = config;
  }

  // @TODO: This requires more intelligent logic
  getCardSize() {
    return 3;
  }
}

customElements.define('linky-card', LinkyCard);
