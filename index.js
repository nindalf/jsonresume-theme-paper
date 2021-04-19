var fs = require("fs");
var Handlebars = require("handlebars");
var date = require("date-fns")

function getMonth(startDateStr) {
    switch (startDateStr.substr(5,2)) {
    case '01':
        return "January ";
    case '02':
        return "February ";
    case '03':
        return "March ";
    case '04':
        return "April ";
    case '05':
        return "May ";
    case '06':
        return "June ";
    case '07':
        return "July ";
    case '08':
        return "August ";
    case '09':
        return "September ";
    case '10':
        return "October ";
    case '11':
        return "November ";
    case '12':
        return "December ";
    }
}

function getDuration(startDate, endDate) {
    const diffMonths = date.differenceInMonths(endDate, startDate);
    const months = diffMonths % 12;
    const years = (diffMonths - months) / 12;

    let result = "";
    if (years > 1) {
        result += years.toString() + "years"
    }
    if (years == 1) {
        result += years.toString() + "year"
    }
    if (months > 1){
        result += ', ' + months.toString() + "months"
    }
    if (months == 1){
        result += ', ' + months.toString() + "month"
    }
    return result;
}

function render(resume) {
    // Load css and template
    var css = fs.readFileSync(__dirname + "/css/style.css", "utf-8");
    var template = fs.readFileSync(__dirname + "/resume.template", "utf-8");
    // Load print-specific css
    var print = fs.readFileSync(__dirname + "/css/print.css", "utf-8");

    if (resume.work && resume.work.length) {
        resume.workBool = true;
        resume.work.map(function(w){
            let startDate = new Date();
            let endDate = new Date();
            if (w.startDate) {
                w.startDateYear = (w.startDate || "").substr(0,4);
                w.startDateMonth = getMonth(w.startDate || "");
                startDate = date.parse(w.startDate, 'yyyy-MM-dd', new Date());

            }
            if(w.endDate) {
                w.endDateYear = (w.endDate || "").substr(0,4);
                w.endDateMonth = getMonth(w.endDate || "");
                endDate = date.parse(w.endDate, 'yyyy-MM-dd', new Date());
            } else {
                w.endDateYear = 'Present'
            }
            w.duration = getDuration(startDate, endDate);
            if (w.highlights) {
                if (w.highlights[0]) {
                    if (w.highlights[0] != "") {
                        w.boolHighlights = true;
                    }
                }
            }
        });
    }


    if (resume.education && resume.education.length) {
        if (resume.education[0].institution) {
            resume.educationBool = true;
            resume.education.map(function(e){
                if( !e.area || !e.studyType ){
                  e.educationDetail = (e.area == null ? '' : e.area) + (e.studyType == null ? '' : e.studyType);
                } else {
                  e.educationDetail = e.area + ", "+ e.studyType;
                }
                if (e.startDate) {
                    e.startDateYear = e.startDate.substr(0,4);
                    e.startDateMonth = getMonth(e.startDate || "");
                } else {
                    e.endDateMonth = "";
                }
                if (e.endDate) {
                    e.endDateYear = e.endDate.substr(0,4);
                    e.endDateMonth = getMonth(e.endDate || "")

                } else {
                    e.endDateYear = 'Present'
                    e.endDateMonth = '';
                }
                if (e.courses) {
                    if (e.courses[0]) {
                        if (e.courses[0] != "") {
                            e.educationCourses = true;
                        }
                    }
                }
            });
        }
    }

    // Register custom handlebars extensions ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // foreach loops //
    // http://stackoverflow.com/a/12002281/1263876
    Handlebars.registerHelper("foreach",function(arr,options) {
        if(options.inverse && !arr.length)
            return options.inverse(this);

        return arr.map(function(item,index) {
            item.$index = index;
            item.$first = index === 0;
            item.$notfirst = index !== 0;
            item.$last  = index === arr.length-1;
            return options.fn(item);
        }).join('');
    });
    // Logic operators //
    // http://stackoverflow.com/a/16315366
    Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
        switch (operator) {
            case '==':
                return (v1 == v2) ? options.fn(this) : options.inverse(this);
            case '===':
                return (v1 === v2) ? options.fn(this) : options.inverse(this);
            case '<':
                return (v1 < v2) ? options.fn(this) : options.inverse(this);
            case '<=':
                return (v1 <= v2) ? options.fn(this) : options.inverse(this);
            case '>':
                return (v1 > v2) ? options.fn(this) : options.inverse(this);
            case '>=':
                return (v1 >= v2) ? options.fn(this) : options.inverse(this);
            case '&&':
                return (v1 && v2) ? options.fn(this) : options.inverse(this);
            case '||':
                return (v1 || v2) ? options.fn(this) : options.inverse(this);
            default:
                return options.inverse(this);
        }
    });
    // comma separated lists //
    // http://stackoverflow.com/a/18831911
    Handlebars.registerHelper('commalist', function(items, options) {
        return options.fn(items.join(', '));
    });
    // Compile
    return Handlebars.compile(template)({
        css: css,
        print: print,
        resume: resume
    });
}

module.exports = {
    render: render
};
