source('./r_files/flatten_HTML.r')

############### Library Declarations ###############
libraryRequireInstall("ggplot2");
libraryRequireInstall("plotly");
libraryRequireInstall("htmlwidgets");
####################################################

################### Actual code ####################
dataFrame <- data.frame(Axis, Values[[1]]);

columns = ncol(Values);

#Checking if colour and Threshold Colouring have been set, and setting defaults if not
baseColour = "#FD625E"
thresholdActive = FALSE;
legendActive = TRUE;
if(exists("ColourSettings_fill")){
	baseColour = as.character(ColourSettings_fill);
}
if(exists("ColourSettings_thresholdActive")){
	thresholdActive = as.logical(ColourSettings_thresholdActive);
}
if(exists("Legend_legendActive")){
	legendActive = as.logical(Legend_legendActive);
}

#Threshold Colouring
if(thresholdActive){

	#Checking if colours and thresholds have been set, and setting defaults if not
	if(exists("ColourSettings_threshold1")){
		threshold1Value = ColourSettings_threshold1;
	}else{
		threshold1Value = 40;
	}
	if(exists("ColourSettings_colour1")){
		threshold1Colour = as.character(ColourSettings_colour1);
	}else{
		threshold1Colour = "#F2C80F";
	}
	if(exists("ColourSettings_threshold2")){
		threshold2Value = ColourSettings_threshold2;
	}else{
		threshold2Value = 70;
	}
	if(exists("ColourSettings_colour2")){
		threshold2Colour = as.character(ColourSettings_colour2);
	}else{
		threshold2Colour = "#01B8AA";
	}
	
	thresholds <- c(-Inf, threshold1Value, threshold2Value, Inf);
	p <- plot_ly(
			marker = list(color = colours),
	)
	for(cols in 1:ncol(Values)){
		if(exists("OutlierSettings_outlieractive")){
			outlieractive = as.logical(OutlierSettings_outlieractive);
			if(outlieractive){
				min = min(Values[[cols]]);
				max = max(Values[[cols]]);
				if(min(Values[[cols]]) < min){
				min = min(Values[[cols]]);	
				}		
				if(max(Values[[cols]]) > max){
				max = max(Values[[cols]]);	
				}
				iqr1 = IQR(Values[[cols]]);
				min1 = min(Values[[cols]]) + iqr1;
				max1 = max(Values[[cols]]) - iqr1;
				for (vals in 1:nrow(Values)){
					if(Values[[cols]][[vals]] > max1){
						Values[[cols]] <- replace(Values[[cols]], vals, (max + 1));
					}	
					if(Values[[cols]][[vals]] < min1){
						Values[[cols]] <- replace(Values[[cols]], vals, (min -1));
					}	
				}
			}
		}
		rgbvals = col2rgb(baseColour);
		rgbvals[1] = max(0, rgbvals[1] - (15 * (cols-1)));
		rgbvals[2] = max(0, rgbvals[2] - (15 * (cols-1)));
		rgbvals[3] = max(0, rgbvals[3] - (15 * (cols-1)));
		baseColour = rgb(rgbvals[1], rgbvals[2], rgbvals[3], maxColorValue = 255);
		rgbvals = col2rgb(threshold1Colour);
		rgbvals[1] = max(0, rgbvals[1] - (15 * (cols-1)));
		rgbvals[2] = max(0, rgbvals[2] - (15 * (cols-1)));
		rgbvals[3] = max(0, rgbvals[3] - (15 * (cols-1)));
		threshold1Colour = rgb(rgbvals[1], rgbvals[2], rgbvals[3], maxColorValue = 255);
		rgbvals = col2rgb(threshold2Colour);
		rgbvals[1] = max(0, rgbvals[1] - (15 * (cols-1)));
		rgbvals[2] = max(0, rgbvals[2] - (15 * (cols-1)));
		rgbvals[3] = max(0, rgbvals[3] - (15 * (cols-1)));
		threshold2Colour = rgb(rgbvals[1], rgbvals[2], rgbvals[3], maxColorValue = 255);
		colours <- c(baseColour,threshold1Colour,threshold2Colour)[findInterval(Values[[cols]], vec=thresholds)]
		if(outlieractive){
			p <- add_bars(p,
				x=dataFrame[[1]],
				y=Values[[cols]],
				data=Values,
				name=colnames(Values)[[cols]],
				marker = list(color = colours),
				evaluate = TRUE,
				showlegend = legendActive,
				transforms = list(
					list(
						type = 'filter',
						target = 'y',
						operation = '<=',
						value = max 
					),
					list(
						type = 'filter',
						target = 'y',
						operation = '>=',
						value = min 
					)
				)
			)
		}
		else{
			p <- add_bars(p,
				x=dataFrame[[1]],
				y=Values[[cols]],
				data=Values,
				name=colnames(Values)[[cols]],
				marker = list(color = colours),
				evaluate = TRUE,
				showlegend = legendActive
			)
		}
	}
	#rangeslider(p, dataFrame$x[10], dataFrame$x[100000])
}else{ #No Threshold Colouring
	p <- plot_ly(
			marker = list(color = baseColour),
	)
	for(cols in 1:ncol(Values)){
		if(exists("OutlierSettings_outlieractive")){
			outlieractive = as.logical(OutlierSettings_outlieractive);
			if(outlieractive){
				min = min(Values[[cols]]);
				max = max(Values[[cols]]);
				if(min(Values[[cols]]) < min){
				min = min(Values[[cols]]);	
				}		
				if(max(Values[[cols]]) > max){
				max = max(Values[[cols]]);	
				}
				iqr1 = IQR(Values[[cols]]);
				min1 = min(Values[[cols]]) + iqr1;
				max1 = max(Values[[cols]]) - iqr1;
				for (vals in 1:nrow(Values)){
					if(Values[[cols]][[vals]] > max1){
						Values[[cols]] <- replace(Values[[cols]], vals, (max + 1));
					}	
					if(Values[[cols]][[vals]] < min1){
						Values[[cols]] <- replace(Values[[cols]], vals, (min -1));
					}	
				}
			}
		}
		rgbvals = col2rgb(baseColour);
		rgbvals[1] = max(0, rgbvals[1] - (15 * (cols-1)));
		rgbvals[2] = max(0, rgbvals[2] - (15 * (cols-1)));
		rgbvals[3] = max(0, rgbvals[3] - (15 * (cols-1)));
		baseColour = rgb(rgbvals[1], rgbvals[2], rgbvals[3], maxColorValue = 255);
		if(outlieractive){
			p <- add_bars(p,
				x=dataFrame[[1]],
				y=Values[[cols]],
				data=Values,
				name=colnames(Values)[[cols]],
				marker = list(color = baseColour),
				evaluate = TRUE,
				showlegend = legendActive,
				transforms = list(
					list(
						type = 'filter',
						target = 'y',
						operation = '<=',
						value = max 
					),
					list(
						type = 'filter',
						target = 'y',
						operation = '>=',
						value = min 
					)
				)
			)
		}
		else{
			p <- add_bars(p,
				x=dataFrame[[1]],
				y=Values[[cols]],
				data=Values,
				name=colnames(Values)[[cols]],
				marker = list(color = baseColour),
				evaluate = TRUE,
				showlegend = legendActive
			)
		}
	}
	#rangeslider(dataFrame$x[10], dataFrame$x[100000])
}

####################################################

############# Create and save widget ###############
internalSaveWidget(p, 'out.html');
####################################################
