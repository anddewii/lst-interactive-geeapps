// (pulled from Scripts/User Interface/Mosaic Editor) //
var colors = {'transparent': '#11ffee00', 'gray': '#F8F9FA', 'gray1':'#707080', 'dark': '#050606'};


var palettes = require('users/gena/packages:palettes');
var palette = palettes.misc.jet[7];

var TITLE_STYLE = {
  fontWeight: 'bold',
  fontSize: '32px',
  padding: '8px',
  color: '#cc0000',
  //textAlign: 'center',
  backgroundColor: colors.transparent,
};

var SUBTITLE_STYLE = {
  fontWeight: 'bold',
  fontSize: '16px',
  padding: '8px',
  color: colors.gray1,
  textAlign: 'center',
  //maxWidth: '450px',
  backgroundColor: colors.transparent,
};

var PARAGRAPH_STYLE = {
  fontSize: '14px',
  fontWeight: '50',
  color: colors.gray1,
  textAlign: 'justify',
  padding: '8px',
  maxWidth: '500px',
  backgroundColor: colors.transparent,
};

var BUTTON_STYLE = {
  fontSize: '14px',
  fontWeight: '100',
  color: colors.gray1,
  padding: '8px',
  backgroundColor: colors.transparent,
};

var SELECT_STYLE = {
  fontSize: '14px',
  fontWeight: '50',
  color: colors.gray1,
  padding: '2px',
  backgroundColor: colors.transparent,
  width: '115px'
};

var LABEL_STYLE = {
  fontWeight: '50',
  textAlign: 'center',
  fontSize: '14px',
  color: colors.gray1,
  padding: '2px',
  backgroundColor: colors.transparent,
};

var INFO_STYLE = {
  fontSize: '14px',
  fontWeight: '50',
  color: colors.gray1,
  textAlign: 'justify',
  margin:'3px 8px',
  maxWidth: '500px',
  backgroundColor: colors.transparent,
};
// Create root panel, i.e., side panel and map panel for hold the other widgets
var infoPanel = ui.Panel({
    layout: ui.Panel.Layout.flow(),
    style: {
      stretch: 'horizontal',
      height: '100%',
      width: '350px',
      backgroundColor: colors.gray
    }
});

// Adding new root widget and clear original widget
var mappingPanel = ui.root.widgets().get(0);
ui.root.clear();
// Split the new panel
ui.root.add(ui.SplitPanel(mappingPanel, infoPanel));

Map.setCenter(109.68646804794099,-7.355859405657855, 7);

// Create date pane, visualization panel, and graph panel for side panel---------------------------------
var datePanel = ui.Panel({layout: ui.Panel.Layout.flow('horizontal'), 
                            style: {backgroundColor: colors.transparent}});
var visPanel = ui.Panel({style: {backgroundColor: colors.transparent}}); 
var graphPanel = ui.Panel({style: {backgroundColor: colors.transparent}});

// Settings for side panel info--------------------------------------------------------------------------
// Adding the text for title and sub-title using "ui.label" function
infoPanel.add(ui.Label('LAND SURFACE TEMPERATURE', TITLE_STYLE));

var app_description = 'Aplikasi ini merupakan aplikasi yang dirancang agar dapat melakukan identifikasi Land Surface Temperature (LST) pada suatu wilayah secara interaktif.';


infoPanel.add(ui.Label(app_description, PARAGRAPH_STYLE));

// Add temporal settings---------------------------------------------------------------------------------
infoPanel.add(datePanel);
infoPanel.insert(2, ui.Label('PENGATURAN TEMPORAL', SUBTITLE_STYLE));

// Add Tahun tool
var tahunLabel = ui.Label({
  value: 'Pilih Tahun',
  style: LABEL_STYLE
});

var Year_selector = ui.Select({
    
    items: [
      {label: '2013', value: 2013},
      {label: '2014', value: 2014},
      {label: '2015', value: 2015},
      {label: '2016', value: 2016},
      {label: '2017', value: 2017},
      {label: '2018', value: 2018},
      {label: '2019', value: 2019},
      {label: '2020', value: 2020},
      {label: '2021', value: 2021},
      {label: '2022', value: 2022},
    ],style:{width: '150px'}
  
  }).setPlaceholder('Select year...');

var yearSelector = ui.Select({
  placeholder: 'please wait..',
  });

var runButton = ui.Button({label: 'Run', style: {width: '150px'}});
  
infoPanel.add(tahunLabel).add(Year_selector)
infoPanel.add(runButton)


// Add data----------------------------------------------------------------------------------
var loadComposite = function() {
    var start_date = Year_selector.getValue() + '-01-01';
    var end_date = Year_selector.getValue() + '-12-31';
    
    ////
      var col = ee.ImageCollection("MODIS/006/MOD11A2");
      var modDate = col.filter(ee.Filter.date(start_date, end_date))
      var modband = modDate.select('LST_Day_1km')
            
      var lst = modband.map(function(img) {
          return img
            .multiply(0.02)
            .subtract(273.15)
            .copyProperties(img, ['system:time_start']);
      });

    var LSTVis = {min:0, max:50, palette: palette};

  Map.setCenter(109.68646804794099,-7.355859405657855, 7)
  mappingPanel.addLayer(lst, LSTVis, Year_selector.getValue() +'LST_Day_1km');
}

runButton.onClick(loadComposite)

/*
 * Legend setup
 */
var vis = {min:0, max:50, palette: ['blue','red','yellow']};
//Function legend
function createColorBar(titleText, palette, min, max) {
  // Legend Title
  var title = ui.Label({
    value: titleText, 
    style: {fontWeight: 'bold', textAlign: 'center', stretch: 'horizontal'}});

  // Colorbar
  var legend = ui.Thumbnail({
    image: ee.Image.pixelLonLat().select(0),
    params: {
      bbox: [0, 0, 1, 0.1],
      dimensions: '200x20',
      format: 'png', 
      min: 0, max: 1,
      palette: palette},
    style: {stretch: 'horizontal', margin: '8px 8px', maxHeight: '40px'},
  });
  
  // Legend Labels
  var labels = ui.Panel({
    widgets: [
      ui.Label(min, {margin: '4px 10px',textAlign: 'left', stretch: 'horizontal'}),
      ui.Label((min+max)-40, {margin: '4px 20px', textAlign: 'center', stretch: 'horizontal'}),
      ui.Label((min+max)-30, {margin: '4px 20px', textAlign: 'center', stretch: 'horizontal'}),
      ui.Label((min+max)-20, {margin: '4px 20px', textAlign: 'center', stretch: 'horizontal'}),
      ui.Label((min+max)-10, {margin: '4px 20px', textAlign: 'center', stretch: 'horizontal'}),
      ui.Label(max, {margin: '4px 10px',textAlign: 'right', stretch: 'horizontal'})],
    layout: ui.Panel.Layout.flow('horizontal')});
  
  // Create a panel with all 3 widgets
  var legendPanel = ui.Panel({
    widgets: [title, legend, labels],
    style: {position: 'bottom-left', padding: '8px 15px'}
  })
  return legendPanel
}
// Call the function to create a colorbar legend  
var colorBar = createColorBar('LST Values (°C)', palette, 0, 50)
infoPanel.add(colorBar);

////////////DRAWING TOOLS
// Create interactive region reduction for generate the chart----------------------------------
var drawingTools = mappingPanel.drawingTools();

while (drawingTools.layers().length() > 0) {
  var layer = drawingTools.layers().get(0);
  drawingTools.layers().remove(layer);
}

var dummyGeometry =
    ui.Map.GeometryLayer({geometries: null, name: 'geometry', color: '23cba7'});

drawingTools.layers().add(dummyGeometry);

// Create drawing button
function clearGeometry() {
  var layers = drawingTools.layers();
  layers.get(0).geometries().remove(layers.get(0).geometries().get(0));
}

function drawRectangle() {
  clearGeometry();
  drawingTools.setShape('rectangle');
  drawingTools.draw();
}

function drawPolygon() {
  clearGeometry();
  drawingTools.setShape('polygon');
  drawingTools.draw();
}

function drawPoint() {
  clearGeometry();
  drawingTools.setShape('point');
  drawingTools.draw();
}


// Create regional time series
var chartPanel = ui.Panel({
  style:
      {height: '235px', width: '600px', position: 'top-right', shown: false}
});


function chartLSTTimeSeries(imageCol, year) {
  // Make the chart panel visible the first time a geometry is drawn.
  if (!chartPanel.style().get('shown')) {
    chartPanel.style().set('shown', true);
  }
  
  // Get the drawn geometry; it will define the reduction region.
  var aoi = drawingTools.layers().get(0).getEeObject();

  // Set the drawing mode back to null; turns drawing off.
  drawingTools.setShape(null);

  // Reduction scale is based on map scale to avoid memory/timeout errors.
  var mapScale = Map.getScale();
  var scale = mapScale > 5000 ? mapScale * 2 : 5000;


  // LST time series
  var start_date = Year_selector.getValue() + '-01-01';
  var end_date = Year_selector.getValue() + '-12-31';
  var col = ee.ImageCollection("MODIS/006/MOD11A2");
  var modDate = col.filter(ee.Filter.date(start_date, end_date))
  var modband = modDate.select('LST_Day_1km')
            
   var lst = modband.map(function(img) {
         return img
          .multiply(0.02)
          .subtract(273.15)
          .copyProperties(img, ['system:time_start']);
      });


  //print(LC8);
  // Chart NDVI time series for the selected area of interest.
  var chart = ui.Chart.image
                  .seriesByRegion({
                    imageCollection: ee.ImageCollection(lst),
                    regions: aoi,
                    reducer: ee.Reducer.mean(),
                    band: 'LST_Day_1km',
                    scale: scale,
                    xProperty: 'system:time_start'
                  })
                  .setChartType('LineChart')
                  .setOptions({
                    title: 'Grafik LST(°C)',
                    legend: {position: 'none'},
                    interpolateNulls: true,
                    curveType: 'function',
                    hAxis: {title: 'Date', format: 'YYYY-MMM', gridlines: {count: 13}},
                    vAxis: {title: 'LST'},
                    series: {0: {color: '#2ec21d'}}
                  });

  // Replace the existing chart in the chart panel with the new chart.
  chartPanel.widgets().reset([chart]);
}

drawingTools.onDraw(ui.util.debounce(chartLSTTimeSeries, 500));
drawingTools.onEdit(ui.util.debounce(chartLSTTimeSeries, 500));


// UI for drawing tools------------------------------------------------------------------------------
var symbol = {
  rectangle: '⬛',
  polygon: '🔺',
  point: '📍',
};

var controlPanel = ui.Panel({
  widgets: [
    ui.Label('Pilih mode digitasi:'),
    ui.Button({
      label: symbol.rectangle + ' Rectangle',
      onClick: drawRectangle,
      style: {stretch: 'horizontal'}
    }),
    ui.Button({
      label: symbol.polygon + ' Polygon',
      onClick: drawPolygon,
      style: {stretch: 'horizontal'}
    }),
    ui.Button({
      label: symbol.point + ' Point',
      onClick: drawPoint,
      style: {stretch: 'horizontal'}
    })
  ],
  style: {position: 'bottom-left'},
  layout: null,
});


infoPanel.add(controlPanel);
infoPanel.add(chartPanel);


var app_info1 = 'Dataset: MOD11A2.006 Terra Land Surface Temperature and Emissivity 8-Day Global 1km';
var app_info2 = 'Author: Ananda Rianti Dewi';
var app_info3 = 'Email : anandadewii14@gmail.com';
infoPanel.add(ui.Label(app_info1, INFO_STYLE));
infoPanel.add(ui.Label(app_info2, INFO_STYLE));
infoPanel.add(ui.Label(app_info3, INFO_STYLE));



