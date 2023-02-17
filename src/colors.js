// export const ORANGE_FILL = 'rgba(255, 89, 0, 0.04)';
export const ORANGE_BORDER = 'rgba(255, 89, 0, 1)';
export const ORANGE_FILL = 'rgba(255, 89, 0, 1)';
export const ORANGE_LIGHT = 'rgba(255, 89, 0, 0.5)';

// export const BLUE_FILL = 'rgba(0, 189, 187, 0.04)';
export const BLUE_BORDER = 'rgba(0, 189, 187, 1)';
export const BLUE_LIGHT = 'rgba(0, 189, 187, 0.35)';
export const BLUE_FILL = 'rgba(0, 189, 187, 1)';
export const BLUE_DARK = 'rgba(0, 109, 101, 1)';

// export const GREEN_FILL = 'rgb(51, 204, 89, 0.04)';
export const GREEN_BORDER = 'rgb(51, 204, 89, 1)';
export const GREEN_FILL = 'rgb(51, 204, 89, 1)';

// export const YELLOW_FILL = 'rgb(249, 200, 6, 0.04)';
export const YELLOW_BORDER = 'rgb(249, 200, 6, 1)';
export const YELLOW_FILL = 'rgb(249, 200, 6, 1)';

// export const RED_FILL = 'rgb(255, 0, 0, 0.04)';
export const RED_BORDER = 'rgb(255, 0, 0, 1)';
export const RED_FILL = 'rgb(255, 0, 0, 1)';
export const BLACK = 'rgb(0, 0, 0, 1)';
export const WHITE = 'rgb(255, 255, 255, 1)';

export const GRAY = 'rgb(153, 145, 145, 1)';
export const PRIMARY = 'rgb(25,118,210)';

//export const CLOUD = ["#1976D2","#246BB3","#80B7ED","#075DB3","#0A6BCC","#1861AB"];
export const CLOUD = ["#1976D2","#082E54","#67A9EB","#0A56A3","#B7D6F6"];

// Chart itemStyles
export const ITEM_STYLE_BAR_BLUE = {
  color: BLUE_FILL,
  barBorderWidth: 1,
  barBorderColor: BLUE_BORDER,
  barBorderRadius: 1,
};

export const ITEM_STYLE_BAR_ORANGE = {
  color: ORANGE_FILL,
  barBorderWidth: 1,
  barBorderColor: ORANGE_BORDER,
  barBorderRadius: 1,
};

// Chart itemStyles
export const ITEM_STYLE_LINE_BLUE = {
  color: BLUE_FILL,
  width: 3,
};

export const ITEM_STYLE_LINE_ORANGE = {
  color: ORANGE_LIGHT,
  width: 6,
};

export const ITEM_STYLE_BAR_SENTIMENT_POS = {
  color: GREEN_FILL,
  barBorderWidth: 1,
  barBorderColor: GREEN_BORDER,
  barBorderRadius: 1,
};

export const ITEM_STYLE_BAR_SENTIMENT_NEU = {
  color: YELLOW_FILL,
  barBorderWidth: 1,
  barBorderColor: YELLOW_BORDER,
  barBorderRadius: 1,
};

export const ITEM_STYLE_BAR_SENTIMENT_NEG = {
  color: RED_FILL,
  barBorderWidth: 1,
  barBorderColor: RED_BORDER,
  barBorderRadius: 1,
};

export const getToreHighlightColor = function (str){
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    // eslint-disable-next-line no-bitwise
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  var color = '#';
  for (var m = 0; m < 3; m++) {
    // eslint-disable-next-line no-bitwise
    var value = (hash >> (m * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};