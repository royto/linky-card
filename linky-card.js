const LitElement = Object.getPrototypeOf(
  customElements.get("ha-panel-lovelace")
);
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

function hasConfigOrEntityChanged(element, changedProps) {
  if (changedProps.has("config")) {
    return true;
  }

  const oldHass = changedProps.get("hass");
  if (oldHass) {
    return (
      oldHass.states[element.config.entity] !==
        element.hass.states[element.config.entity]
    );
  }

  return true;
}

toFloat = (value, decimals = 1) => Number.parseFloat(value).toFixed(decimals);

previousMonth = () => new Date((new Date().getTime()) - 365*60*60*24*1000)
                    .toLocaleDateString('fr-FR', {month: "long", year: "numeric"});

class LinkyCard extends LitElement {
  static get properties() {
    return {
      config: {},
      hass: {}
    };
  }

  render() {
    if (!this.config || !this.hass) {
      return html``;
    }

    const stateObj = this.hass.states[this.config.entity];

    if (!stateObj) {
      return html`
        <ha-card>
          <div class="card">
            <div id="states">
              <div class="name">
                <ha-icon id="icon" icon="mdi:flash" data-state="unavailable" data-domain="connection" style="color: var(--state-icon-unavailable-color)"></ha-icon>
                <span style="margin-right:2em">Linky : Site Enedis.fr inaccessible</span>
              </div>
            </div>
          </div>
        </ha-card> 
      `
    }

    const attributes = stateObj.attributes;

    if (stateObj) {
      return html`
        <ha-card>
          <div class="card">
            <div class="hp-hc-block">
              <span class="conso-hc">${toFloat(attributes.offpeak_hours)}</span><span class="conso-unit-hc"> ${attributes.unit_of_measurement} <span class="more-unit">(en HC)</span></span><br />
              <span class="conso-hp">${toFloat(attributes.peak_hours)}</span><span class="conso-unit-hp"> ${attributes.unit_of_measurement} <span class="more-unit">(en HP)</span></span>
            </div>
            <div class="cout-block">
              <span class="cout" title="Coût journalier">${toFloat(attributes.daily_cost, 2)}</span><span class="cout-unit"> €</span>
            </div>
            <div class="clear"></div>
            <span>
              <ul class="variations-linky right">
                  <li><span class="ha-icon"><ha-icon icon="mdi:flash"></ha-icon></span>${Math.round(attributes.peak_offpeak_percent)}<span class="unit"> % HP</span></li>
              </ul>
              <ul class="variations-linky">
                  <li><span class="ha-icon"><ha-icon icon="mdi:arrow-right" style="transform: rotate(${(attributes.monthly_evolution < 0) ? '45' : ((attributes.monthly_evolution == 0) ? "0" : "-45")}deg)"></ha-icon></span>${Math.round(attributes.monthly_evolution)}<span class="unit"> %</span><span class="previous-month">par rapport à ${previousMonth()}</span></li>
              </ul>
            </span>
            ${this.renderHistory(attributes.daily, attributes.unit_of_measurement)}
          </div>
        <ha-card>`
    }
  }

  renderHistory(daily, unit_of_measurement) {
    if (this.config.showHistory === true) {
      return html
        `
          <div class="week-history">
            ${daily.slice(2, 7).reverse().map((day, index) => this.renderDay(day, index, unit_of_measurement))}
          </div>
        `
    }
  }

  renderDay(day, dayNumber, unit_of_measurement) {
    return html
      `
        <div class="day">
          <span class="dayname">${new Date(new Date().setDate(new Date().getDate()-(6-Number.parseInt(dayNumber)))).toLocaleDateString('fr-FR', {weekday: "long"}).split(' ')[0]}</span>
          <br><span class="cons-val">${toFloat(day)} ${unit_of_measurement}</span>
        </div>
      `
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define an entity');
    }
    const defaultConfig = {
      showHistory : true,
    }

    this.config = {
      ...defaultConfig,
      ...config
    };
  }

  shouldUpdate(changedProps) {
    return hasConfigOrEntityChanged(this, changedProps);
  }

  // @TODO: This requires more intelligent logic
  getCardSize() {
    return 3;
  }

  static get styles() {
    return css`
      .clear {
        clear: both;
      }
    
      .card {
        margin: auto;
        padding: 1.5em 1em 1em 1em;
        position: relative;
      }
    
      .ha-icon {
        margin-right: 5px;
        color: var(--paper-item-icon-color);
      }
      
      .hp-hc-block {
        float: left;
        text-align: right;
        margin-left: 1em;
      }
      
      .cout-block {
        padding-top: 1em;
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
        display: flex;
      }
    
      .day {
        flex: auto;
        text-align: center;
        border-right: .1em solid var(--divider-color);
        line-height: 2;
        box-sizing: border-box;
      }
    
      .dayname {
        text-transform: uppercase;
      }
  
      .week-history .day:last-child {
        border-right: none;
      }
    
      .cons-val {
        font-weight: bold;
      }
      
      .previous-month {
        font-size: 0.8em;
        font-style: italic;
        margin-left: 5px;
      }
      `;
  }
}

customElements.define('linky-card', LinkyCard);
