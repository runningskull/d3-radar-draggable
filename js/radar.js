var RadarChart = require('./radar-chart')

var d = [
  [
    {axis: "strength", value: 13, order:0}, 
    {axis: "intelligence", value: 1, order:1}, 
    {axis: "dexterity", value: 4, order:2},  
    {axis: "luck", value: 10, order:3},
    {axis: "azole", value: 10, order:4}
  ]
]

RadarChart.draw('#board', d)

