define([
    'core/js/adapt',
    'backbone'
], function(Adapt, Backbone) {
    
    var LanguagePickerNavView = Backbone.View.extend({
        
        tagName: 'button',
        expanded: false,
        
        className: function () {
            var classNames = 'languagepicker-flag base';
            
            return classNames;
        },

        events: {
            'click button': 'onButtonClick',
            'click .languagepicker-language': 'onClick'
        },
        
        /*events: {
            'click': 'onClick'
        },*/

        render: function () {
            var data = this.model.toJSON();
            var template = Handlebars.templates[this.constructor.template];
            this.$el.html(template(data));
        },
        
        initialize: function () {
            this.listenTo(Adapt, 'remove', this.remove);
            this.listenTo(Adapt, 'languagepicker:changelanguage:yes', this.onDoChangeLanguage);
            this.listenTo(Adapt, 'languagepicker:changelanguage:no', this.onDontChangeLanguage);
            this.render();
        },
        
        onClick: function (event) {
            $('.navigation').css('overflow','visible');
            if (this.expanded) {
                $(".languagepicker").animate({height:44},200, function(complete) {
                    $('.languagepicker').css('overflow-y','hidden');
                });
            } else {
                $(".languagepicker").animate({height:200},200, function(complete) {
                    $('.languagepicker').css('overflow-y','auto');
                });
            }
            this.expanded = !this.expanded;
        },

        onButtonClick: function (event) {
            if ($(event.target).attr('selected')) {
                return;
            }
            var newLanguage = $(event.target).attr('data-language');
            this.model.set('newLanguage', newLanguage);
            var data = this.model.getLanguageDetails(newLanguage);
            
            var promptObject = {
                _classes: "dir-ltr",
                title: data.warningTitle,
                body: data.warningMessage,
                _prompts:[
                    {
                        promptText: data._buttons.yes,
                        _callbackEvent: "languagepicker:changelanguage:yes"
                    },
                    {
                        promptText: data._buttons.no,
                        _callbackEvent: "languagepicker:changelanguage:no"
                    }
                ],
                _showIcon: true
            };

            if (data._direction === 'rtl') {
                promptObject._classes = "dir-rtl";
            }
            
            //keep active element incase the user cancels - usually navigation bar icon
            this.$finishFocus = $.a11y.state.focusStack.pop();
            //move drawer close focus to #focuser
            $.a11y.state.focusStack.push($("#focuser"));
            Adapt.trigger('notify:prompt', promptObject);
        },
        
        onDoChangeLanguage: function () {
            // set default languge
            var newLanguage = this.model.get('newLanguage');
            this.model.setLanguage(newLanguage);
            this.remove();
        },
        
        onDontChangeLanguage: function () {
            this.remove();

            //wait for notify to close fully
            _.delay(_.bind(function(){
                //focus on navigation bar icon
                this.$finishFocus.a11y_focus();
            }, this), 500);

        }
        
    },{
        template: 'languagePickerFlagView'
    });

    return LanguagePickerNavView;

});
