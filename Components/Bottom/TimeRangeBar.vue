<template>
    <div id="time-range-bar">

      <div>
        <!-- Two cols -->
        <div class="container-columns" style="align-items: end">
          
          <!-- Controls/Start stop -->
          <!-- Start and ending date -->
          <div class="infoStartEndDate notextselect">
            <div><b>Start:</b> {{startStr}}</div>
            <div><b>End:</b> {{endStr}}</div>
          </div>


          <!-- Three rows -->
          <div class="container-rows" style="width:100%">
            <!-- Time slider -->
            <range-slider ref="rangeSlider" 
              @change="onRangeSliderChange($event)" 
              @mousedown="onRangeSliderMouseDown($event)"
              @mouseup="onRangeSliderMouseUp($event)" 
              @drag="onRangeSliderDrag($event)"
            style="height: 50px; width: 100%"></range-slider>
            
            
            <!-- Data availability -->
            <data-streams-bar ref="dataStreamsBar" style="width:100%"></data-streams-bar>
            
            
            
            <!-- Horizontal calendar -->
            <!-- Year calendar -->
            <div class="timeline">
              <button v-for="yy in years" class="m-0 p-0"
                :class="[yy.wght == 0 ? 'hiddenClass' : yy.num % 2 == 0 ? 'yearButton' : 'yearButton even']"
                @click="onYearClicked($event)" :key="yy.num" :id="yy.num" :title="yy.num"
                :style="{width: yy.wght + '%'}">{{yy.name}}</button>
            </div>
            
            <!-- Month calendar -->
            <div class="timeline" ref="monthTimeline">
              <button v-for="mm in months" class="m-0 p-0" :class="[mm.wght == 0 ? 'hiddenClass' : 'monthButton']"
                @click="onMonthClicked($event)" :key="mm.key" :id="mm.key" :title="mm.title"
                :style="{width: mm.wght + '%'}">{{mm.name}}</button>
            </div>
            
            <!-- Days calendar -->
            <Transition> <!-- Vue transition -->
              <div class="timeline" ref="dayTimeline" v-show="days.length!=0">
                <button v-for="dd in days" class="m-0 p-0" :class="[dd.wght == 0 ? 'hiddenClass' : 'dayButton']"
                  @click="onDayClicked($event)" :key="dd.key" :id="dd.key" :title="dd.title"
                  :style="{width: dd.wght + '%'}">{{dd.name}}</button>
              </div>
            </Transition>

          </div>

        </div>

      </div>

    </div>
</template>






<script>
import DataStreamsBar from '/OBSEA/Components/Bottom/DataStreamsBar.vue';
// Import components
import RangeSlider from '/OBSEA/Components/Bottom/RangeSlider.vue'

export default {
    name: "time-range-bar",
    created (){
      // Non-reactive variables this.$options.
      this.startDate = new Date(2011, 7, 21); // month + 1, e.g., 7 is August
      this.endDate = new Date();
      // Start and end dates if startDate and endDate are flexible
      this.limStartDate = new Date(2011, 7, 21); 
      this.limEndDate = new Date();

      // Month names
      this.monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      this.monthAbbr = [
        ['J', 'Jan', 'January'],
        ['F', 'Feb', 'February'],
        ['M', 'Mar', 'March'],
        ['A', 'Apr', 'April'],
        ['M', 'May', 'May'],
        ['J', 'Jun', 'June'],
        ['J', 'Jul', 'July'],
        ['A', 'Aug', 'August'],
        ['S', 'Sep', 'September'],
        ['O', 'Oct', 'October'],
        ['N', 'Nov', 'November'],
        ['D', 'Dec', 'December']
      ];


      // Range slider states
      this.isRangeChanging = false;
      this.isRangeDragging = false;
      // Range array // TODO: initialize with values default values from RangeSlider. Could put a emit on mounted in range slider to set it
      this.rangeArray = [25, 75];
      // Update rate
      this.timeIncrement = 5;
      this.FRAMERATE = 40;
      
    },
    mounted (){
      this.createHTMLTimeline();
      // Set start and end dates
      if (this.$refs.dataStreamsBar)
        this.$refs.dataStreamsBar.setStartEndDates(this.startDate, this.endDate);
      // Create event listener
      window.addEventListener('resize', this.windowIsResizing);
    },
    unmounted() {
      window.removeEventListener('resize', this.windowIsResizing);
    },
    setup() {
        
    },
    data (){
      return {
        months: [],
        years: [],
        days: [],
        selStartDate: new Date(),
        selEndDate: new Date(),
        startStr: '',
        endStr: '',
      }
    },
    methods: {
      // USER HTML ACTIONS
      onRangeSliderChange: function(rangeArray){
        this.rangeArray = rangeArray;
      },

      onRangeSliderDrag: function(rangeArray){
        this.rangeArray = rangeArray;
        this.isRangeDragging = true;
      },
      // Range slider clicked
      // This event is also capturing general mouse down, not only emit. One solution is to check if the event (rangeArray) is an array
      // The other solution is to make a custom event, like rangedown, instead of the general mousedown
      onRangeSliderMouseDown: function(rangeArray){
        // Mouse event has undefined length
        if (rangeArray.length == 2){
          this.isRangeChanging = true;
          this.updateRangeSlider();
        }
      },
      // Range slider is not clicked anymore
      onRangeSliderMouseUp: function(rangeArray){
        this.isRangeChanging = false;
        this.isRangeDragging = false;
      },

      // Update loop according to range slider
      updateRangeSlider: function(){
        let totalTimeSpan = this.endDate.getTime() - this.startDate.getTime();
        // Middle handle (dragging)
        if (this.isRangeDragging){ // Legacy, before there were left and right handels
          // Calculate time increment
          let maxTimeIncrement = totalTimeSpan * 0.05; // 5%

          if (this.rangeArray[0] < 10){
            let factor = (10 - this.rangeArray[0])/10;
            this.timeIncrement = maxTimeIncrement * factor * factor; // squared
            if (this.decreaseStartingDate())
              this.decreaseEndingDate();
          } else if (this.rangeArray[1] > 90){
            let factor = (this.rangeArray[1] - 90) / 10;
            this.timeIncrement = maxTimeIncrement * factor * factor; // squared
            if (this.increaseEndingDate())
              this.increaseStartDate();
          }
        } 

        // Update selected start and end dates  
        this.selStartDate.setTime(this.startDate.getTime() + totalTimeSpan *this.rangeArray[0]/100);
        this.selEndDate.setTime(this.startDate.getTime() + totalTimeSpan * this.rangeArray[1]/100);

        
        // Update HTML timeline
        this.updateHTMLTimeline();

        // Update centered date
        this.updateCenteredDate();

        // Update loop
        if (this.isRangeChanging){
          setTimeout(() => {
              this.updateRangeSlider()
            }, this.FRAMERATE);
        }

        // TODO: UPDATE CENTER DATE ON THE SIMULATION/DATA STREAM
      },

      // Display the year on the timeline
      onYearClicked: function(event){
        let year = parseInt(event.target.id);
        let sDate = new Date(Math.max(new Date(year - 1, 11, 1), this.limStartDate)); // Limit start date
        let eDate = new Date(Math.min(new Date(year + 1, 0, 31), this.limEndDate)); // Limit end date
        // If year is clicked twice, open timeline
        if (sDate.toISOString() == this.startDate.toISOString() && eDate.toISOString() == this.endDate.toISOString()){
          this.startDate = new Date(this.limStartDate);
          this.endDate = new Date(this.limEndDate);
          this.selStartDate = new Date(this.startDate.getUTCFullYear(), this.startDate.getUTCMonth() + 1, this.startDate.getUTCDate());
          this.selEndDate = new Date(this.endDate.getUTCFullYear(), this.endDate.getUTCMonth() - 1, this.startDate.getUTCDate());
        } else{
          this.startDate = sDate;
          this.endDate = eDate;
          // Change selected dates to cover the whole year
          this.selStartDate = new Date(Math.max(new Date(year, 0, 1), this.limStartDate)); // Limit selected start date
          this.selEndDate = new Date(Math.min(new Date(year, 11, 31), this.limEndDate)); // Limit selected start date
        }

        // Set handles in range slider
        this.setRangeSlider();
        this.updateHTMLTimeline();
        this.updateCenteredDate();
      },

      // Display X months on the timeline
      onMonthClicked: function(event){
        let monthsSides = 1; // TODO: VIEWPORT RELATIVE
        let month = parseInt(event.target.id.split('-')[0]);
        let year = parseInt(event.target.id.split('-')[1]);
        let selDate = new Date(year, month);
        let sDate = new Date(Math.max(this.limStartDate, selDate.setUTCMonth(selDate.getUTCMonth() - monthsSides)));
        let eDate = new Date(Math.min(this.limEndDate, selDate.setUTCMonth(selDate.getUTCMonth() + monthsSides*2 + 1)));
        // If month is clicked twice, open year
        // TODO: USER TEST - MAYBE CONFUSING?
        if (sDate.toISOString() == this.startDate.toISOString() && eDate.toISOString() == this.endDate.toISOString()){
          this.onYearClicked({target: {id: year}});
          return;
        }


        this.startDate = sDate;
        this.endDate = eDate;
        // Change selected dates to cover the months
        this.selStartDate = new Date(this.startDate.getTime());
        this.selStartDate.setUTCMonth(this.selStartDate.getUTCMonth() + monthsSides/2); // Add half a month
        this.selEndDate = new Date(this.endDate.getTime());
        this.selEndDate.setUTCMonth(this.selEndDate.getUTCMonth() - monthsSides/2); // Remove half a month
        
        // Set handles in range slider
        this.setRangeSlider();
        this.updateHTMLTimeline();
        this.updateCenteredDate();
      },

      // Display X days on the timeline
      onDayClicked: function (event) {
        let daysSides = 2; // TODO: VIEWPORT RELATIVE
        let day = parseInt(event.target.id.split('-')[0]);
        let month = parseInt(event.target.id.split('-')[1]);
        let year = parseInt(event.target.id.split('-')[2]);
        let selDate = new Date(year, month, day);
        let sDate = new Date(Math.max(this.limStartDate, selDate.setUTCDate(selDate.getUTCDate() - daysSides)));
        let eDate = new Date(Math.min(this.limEndDate, selDate.setUTCDate(selDate.getUTCDate() + daysSides * 2 + 1)));
        // If day is clicked twice, open month
        // TODO: USER TEST - MAYBE CONFUSING?
        if (sDate.toISOString() == this.startDate.toISOString() && eDate.toISOString() == this.endDate.toISOString()) {
          this.onMonthClicked({ target: { id: month + "-" + year } });
          return;
        }


        this.startDate = sDate;
        this.endDate = eDate;
        // Change selected dates to cover the months
        this.selStartDate = new Date(this.startDate.getTime());
        this.selStartDate.setUTCDate(this.selStartDate.getUTCDate() + daysSides/2); // Add half a month
        this.selEndDate = new Date(this.endDate.getTime());
        this.selEndDate.setUTCDate(this.selEndDate.getUTCDate() - daysSides/2); // Remove half a month

        // Set handles in range slider
        this.setRangeSlider();
        this.updateHTMLTimeline();
        this.updateCenteredDate();
      },


      // INTERNAL METHODS
      // Decrease starting date (returns false if the starting date does not decrease)
      decreaseStartingDate(){
        this.startDate.setTime(this.startDate.getTime() - this.timeIncrement);
        if (this.startDate < this.limStartDate){
          this.startDate = new Date(Math.max(this.limStartDate, this.startDate));
          return false;
        }
        return true;
      },
      // Decrease ending date
      decreaseEndingDate(){
        this.endDate.setTime(this.endDate.getTime() - this.timeIncrement);
      },
      // Increase starting date
      increaseStartDate(){
        this.startDate.setTime(this.startDate.getTime() + this.timeIncrement);
      },
      // Increase ending date (returns false if the ending date does not increase)
      increaseEndingDate(){
        this.endDate.setTime(this.endDate.getTime() + this.timeIncrement);
        if (this.endDate > this.limEndDate){
          this.endDate = new Date(Math.min(this.limEndDate, this.endDate));
          return false;
        }
        return true;
      },


      // Update selected start-end dates
      updateStartEndInfo(){
        
        this.startStr = this.startDate.toUTCString().substring(5, 16);//.toDateString().substring(4); 
        this.endStr = this.endDate.toUTCString().substring(5, 16);//.toDateString().substring(4);
        // Emit
        this.$emit('changeSelDates', [this.selStartDate, this.selEndDate]);
        this.$emit('changeLimits', [this.startDate, this.endDate]);

        // TODO > ONLY WHEN STARTDATE AND ENDDATE CHANGE
        if (this.$refs.dataStreamsBar)
          this.$refs.dataStreamsBar.setStartEndDates(this.startDate, this.endDate);
      },

      // Update centered date
      updateCenteredDate(){
        let totalTimeSpan = this.endDate.getTime() - this.startDate.getTime();
        let centeredValue = this.rangeArray[0] * 0.5 + this.rangeArray[1] * 0.5;
        let centeredDate = new Date(this.startDate.getTime() + totalTimeSpan * centeredValue / 100);
        centeredDate.setMinutes(Math.floor(centeredDate.getMinutes() / 30) * 30); // 30 min intervals
        let message = centeredDate.toISOString().substring(0, 16) + "Z";
        if (this.$refs.rangeSlider)
          this.$refs.rangeSlider.setMessage(message);
        if (this.$refs.dataStreamsBar)
          this.$refs.dataStreamsBar.updateCurrentDate(centeredDate.toISOString())
      },


      // Creates the years and months arrays (HTML elements by vue) according to end and start date
      createHTMLTimeline: function(){
        let startMonth = this.startDate.getUTCMonth();
        let startDay = this.startDate.getUTCDate();
        let endMonth = this.endDate.getUTCMonth();
        let endDay = this.endDate.getUTCDate();
        
        // Calculate how many years (and a percentage of the year too)
        // Calculate how many months are between end and start date
        // Calculate how many days
        let startYear = this.startDate.getUTCFullYear();
        let endYear = this.endDate.getUTCFullYear();
        let totalYears = endYear - startYear;

        let daysInFirstMonth = this.getDaysInMonth(startYear, startMonth + 1);
        let daysInLastMonth = this.getDaysInMonth(startYear, startMonth + 1);
        
        // Start and end year are different
        if (totalYears != 0){
          
          this.years = [{ num: startYear, wght: (11 - startMonth + (daysInFirstMonth - startDay) / daysInFirstMonth)/12}];
          this.months = [{ num: startMonth, wght: (daysInFirstMonth - startDay) / daysInFirstMonth, key: startMonth + "-" + startYear, year: startYear, name: this.monthNum2Str(startMonth)}];

          // Fill months from first year
          for (let i = startMonth + 1; i < 12; i++){
            this.months.push({num: i, wght: 1, key: i + "-" + startYear, year: startYear, name: this.monthNum2Str(i)});
          }

          // Fill years
          for (let i = 1; i<=totalYears; i++){
            if (startYear + i != endYear){
              this.years.push({num: startYear + i, wght: 1});
              // Fill months
              for (let j = 0; j<12; j++){
                this.months.push({num: j, wght: 1, key: j + "-" + (startYear+i), year: (startYear + i), name: this.monthNum2Str(j)});
              }
            } else { // Last year is not necessarily complete
              this.years.push({ num: endYear, wght: (endMonth + endDay / daysInLastMonth)/12});// Todo: number of days is relative to the month
              // Fill months last year
              for (let j = 0; j<=endMonth; j++){
                if (j != endMonth)
                  this.months.push({num: j, wght: 1, key: j + "-" + (endYear), year: endYear,  name: this.monthNum2Str(j)});
                else
                  this.months.push({ num: j, wght: endDay / daysInLastMonth, key: j + "-" + (endYear), year: endYear, name: this.monthNum2Str(j)});
              } 
            }
          }
        } 
        // Start and end year are the same
        else {
          this.years = [{ num: startYear, wght: ((endMonth + endDay / daysInLastMonth) - (11 - startMonth + (daysInFirstMonth - startDay) / daysInFirstMonth)) / 12}];
        }


        // Set selected start and end dates
        this.selStartDate = new Date(startYear, startMonth + 1, startDay);
        this.selEndDate = new Date(endYear, endMonth - 1, endDay);
        this.setRangeSlider();
        
        
        // Calculate wght according to number of years/months
        this.calcWidthPercentage();
        // Change month name according to width in pixels
        this.setTimeButtonNames();
        // TODO ERROR: NONE OF THIS WORKS. THE SIDE PANEL CHANGES WIDTH AND SHRINKS monthTimeline, CHANING ITS WIDTH. IT SHOULD DISPATCH AN EVENT BUT IT DOES NOT
        // It is fixed by doing a concatenation of events
        this.$refs.monthTimeline.addEventListener('resize', this.setTimeButtonNames);

        //this.$refs.monthTimeline.addEventListener("webkitTransitionEnd", this.setMonthNames); // Code for Chrome, Safari and Opera
        //this.$refs.monthTimeline.addEventListener("transitionend", this.setMonthNames); // Standard syntax

        // Update selected start-end dates
        this.updateStartEndInfo();

        //console.log(...this.months);
      },






      // Updates the width and visibility of the months and years according to the start and end dates
      updateHTMLTimeline: function(){
        let startYear = this.startDate.getUTCFullYear();
        let startMonth = this.startDate.getUTCMonth();
        let startDay = this.startDate.getUTCDate();
        let startHour = this.startDate.getUTCHours();
        let endYear = this.endDate.getUTCFullYear();
        let endMonth = this.endDate.getUTCMonth();
        let endDay = this.endDate.getUTCDate();
        let endHour = this.endDate.getUTCHours();

        
        
        // Find reactive array indexes
        let sIdxMonths;
        let sIdxYears;
        
        this.months.forEach((mm, index) => {
          if (mm.key == startMonth + '-' + startYear)
            sIdxMonths = index;
        })
        this.years.forEach((yy, index) => {
          if (yy.num == startYear)
            sIdxYears = index;
        })
        // Set everything to zero, then assign
        this.years.forEach(yy => yy.wght = 0);
        this.months.forEach(mm => mm.wght = 0);
        this.days = []; // Reset days and create again here
        let numVisibleMonths = 0;

        // Set weights
        // Iterate over years
        for (let idxY = startYear; idxY <= endYear; idxY++){
          let sM = 0;
          let eM = 11;
          let sumM = 0;
          if (idxY == startYear) // We are in the first year
            sM = startMonth;
          if (idxY == endYear) // We are in the first year
            eM = endMonth;
          
          // Iterate over the months of the year
          for (let idxM = sM; idxM <= eM; idxM++){
            // Optimize? save in a separate array and later assign
            let monthlyWeight = 0;
            // Get days in a month
            let daysInMonth = this.getDaysInMonth(idxY, idxM + 1);
            // Weight according to number of days
            if (idxM == sM && idxY == startYear){ // First month
              let dayWght = (24 - startHour) / 24;
              monthlyWeight = (daysInMonth - (startDay - dayWght)) / daysInMonth;
              monthlyWeight *= daysInMonth/31; // Compensate weights. It solves artifacts when only two months are visible
            } else if (idxY == endYear && idxM == endMonth){ // Last month
              let dayWght = endHour / 24;
              monthlyWeight = (endDay - 1 + dayWght) / daysInMonth;
              monthlyWeight *= daysInMonth / 31; // Compensate weights. It solves artifacts when only two months are visible
            } else
              monthlyWeight = daysInMonth / 31;
            // Store weight
            this.months[sIdxMonths].wght = monthlyWeight;
            // Save as visible month
            numVisibleMonths++;

            // Increase monthly index
            sIdxMonths++;
            // Store sum for yearly weight
            sumM += monthlyWeight;

          }
          // Calculate year weights based on the months
          this.years[sIdxYears].wght = sumM/12;
          // Increase yearly index
          sIdxYears++;          
        }




        // Create days if zoom is enough
        if (numVisibleMonths < 5){ // TODO: SEEN DAYS SHOULD BE RELATIVE TO VIEWPORT?
          // Iterate dates
          for (let idxY = startYear; idxY <= endYear; idxY++) { // Year
            let sM = 0;
            let eM = 11;
            if (idxY == startYear) // We are in the first year
              sM = startMonth;
            if (idxY == endYear) // We are in the first year
              eM = endMonth;
            for (let idxM = sM; idxM <= eM; idxM++) { // Month
              let sD = 1;
              let eD = this.getDaysInMonth(idxY, idxM + 1);
              if(idxM == startMonth) // First month (WARN: because timespan is less than 5 months apart, months from different years are not confused now)
                sD = startDay;
              if (idxM == endMonth) // Last month (WARN: same as above)
                eD = endDay;
              for (let idxD = sD; idxD <= eD; idxD++){
                let dayWght = 1;
                if (idxD == sD && idxM == startMonth) // First day
                  dayWght = (24-startHour)/24;
                else if (idxD == eD && idxM == endMonth){
                  dayWght = endHour / 24;
                }
                this.days.push({
                  num: idxD,
                  wght: dayWght,
                  key: idxD + "-" + idxM + "-" + idxY,
                  title: idxD + "-" + (idxM+1) + "-" + idxY,
                  year: idxY,
                  month: idxM+1,
                  name: idxD
                })
              }
            }
          }
          //this.days = [{ num: startDay, wght: 1, key: startMonth + "-" + startYear, year: startYear, name: this.monthNum2Str(startMonth) }];
        }
        

        // Calculate wght according to number of years/months
        this.calcWidthPercentage();
        // Change month and day names according to width in pixels
        this.setTimeButtonNames();
        // Update selected start-end dates
        this.updateStartEndInfo();

      },

      // Start and end does not change, but the size of the screen does
      windowIsResizing: function(){
        this.updateHTMLTimeline();
        this.updateCenteredDate();
      },


      // Calculate width percentage according to weight
      calcWidthPercentage: function(){
        let totalWidth = this.$refs.monthTimeline.offsetWidth;
        // For days
        if (this.days.length != 0){ // If visible / exist
          this.calcWidthPercentagePerTimeScale(this.days, totalWidth);
        }
        // For months
        this.calcWidthPercentagePerTimeScale(this.months, totalWidth);
        // For years
        this.calcWidthPercentagePerTimeScale(this.years, totalWidth);
        // let totalMonthWght = 0;
        // this.months.forEach(mm => totalMonthWght += mm.wght); // Calculate total month proportion or width
        // this.months.forEach(mm => mm.wght = 100 * mm.wght/totalMonthWght); // Apply width according to element width
        // For years
        // let totalYearWght = 0;
        // this.years.forEach(yy => totalYearWght += yy.wght); // Calculate total month proportion or width
        // this.years.forEach(yy => yy.wght = 100 * yy.wght / totalYearWght); // Apply width according to element width
      },
      // Calculate per time scale
      // TODO: (BUT NEEDS TO BE SPECIFIC FOR MONTHS AND DAYS) take into account end of month and end of year
      calcWidthPercentagePerTimeScale: function (timeItems, totalWidth) {
        let totalWght = 0;
        timeItems.forEach(tt => totalWght += tt.wght); // Calculate total weight

        // Set weight to 0 if pixel width is too small
        let pixelWidth = totalWidth / totalWght;
        let minPixelWidth = 15;
        let skipItemsNum = Math.ceil(minPixelWidth / pixelWidth);
        if (pixelWidth > minPixelWidth)
          timeItems.forEach(tt => tt.wght = 100 * tt.wght / totalWght); // Apply width according to element width
        else{
          let accumulatedWeight = 0;
          timeItems.forEach((tt, i) => {
            let isShown = (i % skipItemsNum) == 0 ? 1 : 0;
            accumulatedWeight += tt.wght;
            // Every skipItemsNum item
            if (isShown){
              tt.wght = accumulatedWeight * 100 / totalWght;
              accumulatedWeight = 0;
            } 
            // Last item
            else if (i == (timeItems.length - 1)){
              console.log(tt.wght + ", " + accumulatedWeight + ", " + i % skipItemsNum);
              tt.wght = accumulatedWeight * 100 / totalWght;
            } 
            // Hidden items
            else 
              tt.wght = 0;
          });
        }
      },


      // Change the month name according to the width in pixels
      setTimeButtonNames: function(){
        let totalWidth = this.$refs.monthTimeline.offsetWidth;
        
        // Years
        this.years.forEach(yy => {
          let pixelWidth = yy.wght / 100 * totalWidth;
          if (pixelWidth < 50)
            yy.name = "'" + String(yy.num).substring(2);
          else
            yy.name = yy.num;
        })

        // Months
        this.months.forEach(mm => {
          let pixelWidth = mm.wght/100 * totalWidth;
          if (pixelWidth < 20)
            mm.name = '';
          else if (pixelWidth < 40)
            mm.name = this.monthAbbr[mm.num][0];
          else if (pixelWidth < 60)
            mm.name = this.monthAbbr[mm.num][1];
          else
            mm.name = this.monthAbbr[mm.num][2];

          // Define title for tootlip
          mm.title = this.monthAbbr[mm.num][2] + ", " + mm.year;
        });
        
        // Days
        if (this.days.length != 0) {
          let pixelsPerDay = totalWidth / this.days.length;
          this.days.forEach(dd => {
            if (pixelsPerDay < 20)
              dd.name = '';
            else
              dd.name = dd.num;
          })
        }
      },



      // Month num to Month string
      monthNum2Str: function(monthNum){
        return this.monthNames[monthNum];
      },

      // Days in a month
      getDaysInMonth: function(year, month) {
        return new Date(year, month, 0).getDate(); // getUTCDate returns daysInMonth - 1
      },

      // Set time range slider according to selected start and end dates
      setRangeSlider: function(){
        let sTime = this.startDate.getTime();
        let eTime = this.endDate.getTime();

        // Calculate percentages
        let timespan = eTime - sTime;
        let sPercentage = 100 * (this.selStartDate.getTime() - sTime )/timespan;
        let ePercentage = 100 - 100 * (eTime - this.selEndDate.getTime())/timespan;

        
        if (this.$refs.rangeSlider){
          this.$refs.rangeSlider.setRange([sPercentage, ePercentage]);
        }
      },



      
      // Makes sure the selected date is in range
      setSelStartDate: function(sDate){
        // Limit selected start date
        this.selStartDate = new Date(Math.max(this.limStartDate, sDate));
        // Set visible starting date one month before selected
        this.startDate = new Date(this.selStartDate.getTime());
        this.startDate.setUTCMonth(this.startDate.getUTCMonth() - 1);
        // Limit start date
        this.startDate = new Date(Math.max(this.limStartDate, this.startDate));
      },
      // Makes sure the selected date is in range
      setSelEndDate: function(eDate){
        // Limit selected end date
        this.selEndDate = new Date(Math.min(this.limEndDate, eDate));
        // Set visible starting date one month after selected
        this.endDate = new Date(this.selEndDate.getTime());
        this.endDate.setUTCMonth(this.endDate.getUTCMonth() + 1);
        // Limit end date
        this.endDate = new Date(Math.min(this.limEndDate, this.endDate));
      },

      

      // PUBLIC METHODS
      // Set the starting and ending dates
      // setSelectedStartEndDates: function(sDate, eDate){
      //   this.setSelStartDate(sDate);
      //   this.setSelEndDate(eDate);
      // },

      // Center the date on a specific date
      centerOnDate: function(cDate){
        let timespan = this.selEndDate.getTime() - this.selStartDate.getTime();
        let timeStart = cDate.getTime() - timespan/2;
        let timeEnd = cDate.getTime() + timespan/2;
        // If starting date is earlier than the limit, add this difference to the end time
        
        if (timeStart < this.limStartDate.getTime()){
          timeEnd += this.limStartDate.getTime() - timeStart;
        }
        // Same for ending date
        if (timeEnd > this.limEndDate.getTime()){
          timeStart -= timeEnd - this.limEndDate.getTime();
        }
        
        // Set starting and ending dates
        this.setSelStartDate(cDate.setTime(timeStart));
        

        this.setSelEndDate(cDate.setTime(timeEnd));

        // Set handles in range slider
        this.setRangeSlider();
        this.updateHTMLTimeline();
        // Emit selected dates. This updates the FishingTracks style
        this.$emit('changeSelDates', [this.selStartDate, this.selEndDate]);
    
      },






    },
    components: {
      'range-slider': RangeSlider,
      'data-streams-bar': DataStreamsBar,
    },
    computed: {

    },
    
}
</script>




<style scoped>
.timeline {
  white-space: nowrap;
  overflow: hidden;
  position: relative;
  width: 100%;
  height: 20px;

  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;

  background-color: rgb(149, 224, 255,0.9);
  
}

.hiddenClass {
  opacity: 0;
  border: none;
}

.m-0 {
  margin: 0;
}
.p-0 {
  padding: 0;
}

.dayButton, .monthButton, .yearButton{
  height: 100%;
  border: 1px solid #02488e33;
  background: none;
 
  -ms-user-select:none;
  -moz-user-select:none;
  -webkit-user-select:none;
  -webkit-touch-callout: none;
  -khtml-user-select: none;
  user-select:none;

  opacity: 1;
  transition: width 0.15s, opacity 0.5s;
}

.yearButton.even {
  background: rgba(0, 81, 255, 0.05);
}

.dayButton:hover, .monthButton:hover,
.yearButton:hover {
  background: #e3f8ff7d;
}

.notextselect {
  user-select:none;
}

.infoStartEndDate {
  font-size: 13px;
  /*width: fit-content;*/
  background: rgba(198, 239, 255, 0.8);
  border-top-right-radius: 0.2rem;
  border-top-left-radius: 0.2rem;

  border-right: 2px solid #02488e33;

  max-width: 130px;
  min-width: 130px;
  padding: 10px;

  align-items: center;
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
}


/* Transition */
.v-enter-active,
.v-leave-active {
  transition: all 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  height: 0;
  transform: translateY(20px);
}
</style>
