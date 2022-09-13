<template>
  <p>{{ error }}</p>
  <Plotly :data="plotData" :layout="plotLayout" />
  <div v-if="position">
    <p>Noorderbreedte: {{ position.latitude.asDegreesMinutes }}</p>
    <p>Oosterlengte: {{ position.longitude.asDegreesMinutes }}</p>
    <p>Precisie: {{ position.accuracy.toFixed(2) }}m</p>
    <p>Laatst bijgewerkt: {{ position.timestamp.toLocaleTimeString() }}</p>
  </div>
  <div v-if="geodesic">
    <p>Cog: {{ geodesic.cog }}°</p>
    <p>Afstand: {{ geodesic.distance.toFixed(2) }}m</p>
    <p>
      Snelheid: {{ geodesic.speed.toFixed(2) }} m/s ({{
        (geodesic.speed * 3.6).toFixed(2)
      }}
      km/u)
    </p>
  </div>
  <table>
    <thead>
      <tr>
        <th>Breedte</th>
        <th>Lengte</th>
        <th>Precisie</th>
        <th>Timestamp</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="position in positions">
        <td>{{ position.latitude.asDegreesMinutes }}</td>
        <td>{{ position.longitude.asDegreesMinutes }}</td>
        <td>{{ position.accuracy.toFixed(2) }}</td>
        <td>{{ position.timestamp.toLocaleTimeString() }}</td>
      </tr>
    </tbody>
  </table>
</template>
<script>
import gps from '../gps.js';
import Plotly from './Plotly.vue';

export default {
  name: 'HelloWorld',
  components: {
    Plotly,
  },
  data: function () {
    return {
      error: null,
      position: null,
      positions: [],
      geodesic: null,
      watchId: null,
      plotData: [
        {
          r: [],
          theta: [],
          type: 'scatterpolar',
          mode: 'markers',
        },
        {
          r: [],
          theta: [],
          type: 'scatterpolar',
          subplot: 'polar2'
        },
      ],
      plotLayout: {
        polar: {
          angularaxis: {
            direction: 'clockwise',
            period: 10
          },
          radialaxis: {
            visible: true,
            angle: 90,
            tickangle: 90,
          },
        },
        polar2: {
          angularaxis: {
            direction: 'clockwise',
          },
          radialaxis: {
            visible: true,
            angle: 90,
            tickangle: 90,
          },
        }
      },
    };
  },
  mounted() {
    this.showPosition();
  },
  unmounted() {
    if (naviator.geolocation && this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
    }
  },
  methods: {
    setError: function (errorMessage) {
      this.error = errorMessage;
    },
    showPosition: function () {
      if (navigator.geolocation) {
        this.watchId = navigator.geolocation.watchPosition(
          this.updatePosition,
          this.setError,
          { enableHighAccuracy: true }
        );
      } else {
        setError('no geo');
      }
    },
    updatePosition: function (position) {
      var pos = new gps.Position(position);
      if (this.position) {
        this.geodesic = new gps.Geodesic(this.position, pos);
      }
      this.position = pos;
      this.positions.push(pos);

      this.updatePlotData();
      this.updatePlotData2();
    },
    updatePlotData: function () {
      if (this.positions.length < 2) {
        return;
      }

      let geodesics = this.getGeodesics();
      this.plotData[0].r = geodesics.map((g) => g.speed);
      this.plotData[0].theta = geodesics.map((g) => g.cog);
    },
    updatePlotData2: function () {
      if (this.positions.length < 2) {
        return;
      }

      let tos = this.positions.slice(1);
      let geodesics = tos.map((to) => new gps.Geodesic(this.positions[0], to));
      this.plotData[1].r = geodesics.map((g) => g.distance);
      this.plotData[1].theta = geodesics.map((g) => g.cog);
    },
    getGeodesics: function () {
      let froms = this.positions.slice(0, -1);
      let tos = this.positions.slice(1);
      return froms.map((from, i) => new gps.Geodesic(from, tos[i]));
    },
  },
};
</script>
