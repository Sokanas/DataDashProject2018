source('./r_files/flatten_HTML.r')

############### Library Declarations ###############
libraryRequireInstall("ggplot2");
libraryRequireInstall("plotly");
libraryRequireInstall("htmlwidgets");
####################################################

################### Actual code ####################
#Import data from PowerBI
dataFrame <- data.frame(Axis, Values[[1]]);

columns = ncol(Values);

#Checking if most main settings have been set either on or off, and setting defaults if not
baseColour = "#FD625E"
thresholdActive = FALSE;
legendActive = TRUE;
sliderActive = TRUE;
if(exists("ColourSettings_fill")){
	baseColour = as.character(ColourSettings_fill);
}
if(exists("ColourSettings_thresholdActive")){
	thresholdActive = as.logical(ColourSettings_thresholdActive);
}
if(exists("Legend_legendActive")){
	legendActive = as.logical(Legend_legendActive);
}
if(exists("ZoomSlider_sliderActive")){
	sliderActive = as.logical(ZoomSlider_sliderActive);
}

#If Threshold Colouring is active
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
	#Initial creation of the graph object
	if(sliderActive){
		p <- plot_ly(
			marker = list(color = colours),
		)%>%
		rangeslider(dataFrame$x[10], dataFrame$x[100000])
	}else{
		p <- plot_ly(
			marker = list(color = colours),
		)
	}

	#Iterate through number of data series' in the Values field, creating a clustered bar chart if there's more than one
	for(cols in 1:ncol(Values)){ 
		#Check if outlier detection is active, and alters values if true
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

		#Maths on the colours provided above to differentiate between bars in the graph
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

		#Add data to the graph object, removing outliers if applicable
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
}else{ #If Threshold Colouring is not active, does not need to check for the existence of those parameters or add them to the graph
	#Initial creation of the graph object
	if(sliderActive){
		p <- plot_ly(
			marker = list(color = colours),
		)%>%
		rangeslider(dataFrame$x[10], dataFrame$x[100000])
	}else{
		p <- plot_ly(
			marker = list(color = colours),
		)
	}

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
}

####################################################

############# Create and save widget ###############
internalSaveWidget(p, 'out.html');
####################################################
