<template>
  <p>{{ error }}</p>
  <div v-if="position">
    <p>Noorderbreedte: {{ position.latitude.asDegreesMinutes }}</p>
    <p>Oosterlengte: {{ position.longitude.asDegreesMinutes }}</p>
    <p>Precisie: {{ position.accuracy.toFixed(2) }}m</p>
    <p>Laatst bijgewerkt: {{ position.timestamp.toLocaleTimeString() }}</p>
  </div>
  <div v-if="geodesic">
    <p>Cog: {{ geodesic.cog }}°</p>
    <p>Afstand: {{ geodesic.distance.toFixed(2) }}m</p>
    <p>Snelheid: {{ geodesic.speed.toFixed(2) }} m/s ({{ (geodesic.speed * 3.6).toFixed(2) }} km/u)</p>
  </div>
  <Plotly :data="plotData" :layout="plotLayout" :display-mode-bar="false"></Plotly>
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
import { Plotly } from 'vue-plotly'

export default {
  name: 'HelloWorld',
  components: {
    Plotly
  },
  data: function () {
    return {
      error: null,
      position: null,
      positions: [],
      geodesic: null,
      watchId: null,
      plotData:[{
        x: [1,2,3,4],
        y: [10,15,13,17],
        type:"scatter"
      }],
      plotLayout: {
        title: "My graph"
      }
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
    },
  },
};
</script>
