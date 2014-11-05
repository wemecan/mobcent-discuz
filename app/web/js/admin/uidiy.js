/**
 * uidiy.js 
 * UI Diy 模块
 *
 * @author 谢建平 <jianping_xie@aliyun.com>
 * @copyright 2012-2014 Appbyme
 */

$(function () {
    var wrapComponent = function f(component) {
        var tmpComponentList = [];
        _.each(component.componentList, function (value) {
            tmpComponentList.push(f(value));
        });
        component.componentList = tmpComponentList;
        return new ComponentModel(component);
    };

    var toggleUICover = function () {
        $('.covering').fadeToggle();
    };

    var submitComponentHelper = function (form) {
        var componentType = $(form['componentType[]']),
            componentTitle = $(form['componentTitle[]']),
            componentDesc = $(form['componentDesc[]']),
            // componentIcon = $(form['componentIcon[]']),
            isShowForumIcon = $(form['isShowForumIcon[]']),
            componentIconStyle = $(form['componentIconStyle[]']),
            isShowForumTwoCols = $(form['isShowForumTwoCols[]']),
            newsModuleId = $(form['newsModuleId[]']),
            forumId = $(form['forumId[]']),
            fastpostForumIds = $(form['fastpostForumIds[]']),
            isShowTopicTitle = $(form['isShowTopicTitle[]']),
            isShowTopicSort = $(form['isShowTopicSort[]']),
            componentRedirect = $(form['componentRedirect[]']),
            componentStyle = $(form['componentStyle[]']);

        var componentList = [];
        for (var i = 0; i < componentType.length; i++) {
            var tempForumIds = [];
            var options = fastpostForumIds[i].selectedOptions;
            for (var j = 0; j < options.length; j++) {
                tempForumIds.push(parseInt(options[j].value));
            }
            var extParams = {
                isShowForumIcon: isShowForumIcon[i].checked ? 1 : 0,
                isShowForumTwoCols: isShowForumTwoCols[i].checked ? 1 : 0,
                newsModuleId: parseInt(newsModuleId[i].value),
                forumId: parseInt(forumId[i].value),
                fastpostForumIds: tempForumIds,
                isShowTopicTitle: isShowTopicTitle[i].checked ? 1 : 0,
                isShowTopicSort: isShowTopicSort[i].checked ? 1 : 0,
                redirect: componentRedirect[i].value,
            };
            var model = new ComponentModel({
                type: componentType[i].value,
                style: componentStyle[i].value,
                // icon: '',
                iconStyle: componentIconStyle[i].value,
                title: componentTitle[i].value,
                desc: componentDesc[i].value,
                
                extParams: extParams,
            });
            componentList.push(model);
        }
        return componentList;
    };

    var ModuleModel = Backbone.Model.extend({
        defaults: uidiyGlobalObj.moduleInitParams,
        sync: function (method, model, options) {
            switch (method) {
                case 'delete':
                    break;
                default:
                    break;
            }
        },
        validate: function (attrs, options) {
            if (attrs.title == '') {
                return '请输入1-4个字母、数字或汉字作为名称';
            }
            return '';
        },
        isNew: function () {
            return !(this.id > 0);
        },
        getLastInsertId: function () {
            return modules.at(modules.length-1).id + 1;
        }
    });

    var ComponentModel = Backbone.Model.extend({
        defaults: uidiyGlobalObj.componentInitParams,
        initialize: function () {
            this.set({id: this.cid});
        },
        sync: function (method, model, options) {
        },
        validate: function (attrs, options) {
            // if (attrs.title == '') {
            //     return '请输入1-4个字母、数字或汉字作为名称';
            // }
            return '';
        },
    });

    var NavItemModel = Backbone.Model.extend({
        defaults: uidiyGlobalObj.navItemInitParams,
        validate: function (attrs, options) {
            if (attrs.title == '') {
                return '请输入1-4个字母、数字或汉字作为名称';
            }
            return '';
        },
    });

    var ModuleList = Backbone.Collection.extend({
        model: ModuleModel,
    });

    var ComponentList = Backbone.Collection.extend({
        model: ComponentModel,
    });

    var NavItemList = Backbone.Collection.extend({
        model: NavItemModel,
    });

    var modules = new ModuleList();
    var navItems = new NavItemList();

    var NavItemView = Backbone.View.extend({
        className: 'nav-item',
        template: _.template($('#navitem-template').html()),
        events: {
            'click .navitem-edit-btn': 'dlgEditNavItem',
            'click .navitem-remove-btn': 'dlgRemoveNavItem',
        },
        initialize: function() {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.remove);

            this.$el.hover(function() {
                $(this).find('.navitem-title').addClass('hidden');
                $(this).find('.nav-edit').removeClass('hidden');
            }, function () {
                $(this).find('.navitem-title').removeClass('hidden');
                $(this).find('.nav-edit').addClass('hidden');
            });
        },
        render: function () {
            this.$el.html(this.template(this.model.attributes));
            return this;
        },
        dlgEditNavItem: function (event) {
            navItemEditDlg.model = this.model;
            navItemEditDlg.render();
            navItemEditDlg.toggle();
        },
        dlgRemoveNavItem: function (event) {
            navItemRemoveDlg.model = this.model;
            navItemRemoveDlg.render();
            navItemRemoveDlg.toggle();
        },
    });

    var ModuleView = Backbone.View.extend({
        template: _.template($('#module-template').html()),
        events: {
            'click .module-edit-btn': 'showModuleEdit',
        },
        initialize: function() {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.remove);
        },
        render: function () {
            this.$el.html(this.template(this.model.attributes));
            return this;
        },
        showModuleEdit: function (event) {
            moduleEditDlg.model = this.model;
            moduleEditDlg.render();
            moduleEditDlg.toggle();
        },
    });

    var ComponentView = Backbone.View.extend({
        className: 'component-view',
        template: _.template($('#component-template').html()),
        events: {
            'change .selectComponentType': 'onChangeComponentType',
            'click .remove-component-btn': 'remove',
        },
        initialize: function() {
        },
        render: function () {
            this.$el.html(this.template(this.model.attributes));
            return this;
        },
        onChangeComponentType: function (event) {
            var id = this.model.id;
            var type = $(event.currentTarget).val();
            $('#component-view-'+type+'-'+id).removeClass('hidden').siblings('.component-view-item').addClass('hidden');
        },
    });
    
    var NewsComponentEditDlg = Backbone.View.extend({
        el: $("#news-component-edit-dlg-view"),
        template: _.template($('#news-component-edit-dlg-template').html()),
        events: {
            'click .news-component-close-btn': 'closeComponentDlg',
            'submit .news-component-edit-form': 'submitNewsComponent',
        },
        render: function () {
            this.$el.html(this.template(this.model.attributes));
            var view = new ComponentView({model: this.model});
            $('.component-view-container').html(view.render().el);
            return this;
        },
        toggle: function () {
            this.$el.fadeToggle();
            toggleUICover();
        },
        closeComponentDlg: function () {
            this.toggle();
            this.$el.html('');
        },
        submitNewsComponent: function (event) {
            event.preventDefault();

            var form = $('.news-component-edit-form')[0];
            var componentList = submitComponentHelper(form);

            this.model.set(componentList[0].attributes);

            var error = this.model.validate(this.model.attributes);
            if (error != '') {
                alert(error);
                return;
            }

            this.moduleModel.tempComponentList.add(this.model, {merge: true, remove: false, add: true});

            this.closeComponentDlg();
        },
    });

    // 自定义风格编辑框
    var CustomStyleEditDlg = Backbone.View.extend({
        el: $("#custom-style-edit-dlg-view"),
        template: _.template($('#custom-style-edit-dlg-template').html()),
        events: {
            'click .style-close-btn': 'closeComponentDlg',
            'submit .style-edit-form': 'submitStyleComponent',
            'change .isShowStyleHeaderRadio' : 'changeShowHeader',
            'change .isShowStyleHeaderMoreRadio' : 'changeShowHeaderMore',
        },
        render: function () {
            this.$el.html(this.template(this.model.attributes));
            this.changeShowHeader();
            this.changeShowHeaderMore();
            return this;
        },
        toggle: function () {
            this.$el.fadeToggle();
            toggleUICover();
        },
        closeComponentDlg: function () {
            this.toggle();
            this.$el.html('');
        },
        submitStyleComponent: function (event) {
            event.preventDefault();

            var form = $('.style-edit-form')[0];
            // var component = new ComponentModel();

            var extParams = {
                styleHeader: {
                    isShow: parseInt(form.isShowStyleHeader.value),
                    title: form.styleHeaderTitle.value,
                    position: parseInt(form.styleHeaderPosition.value),
                    isShowMore: parseInt(form.isShowStyleHeaderMore.value),
                    // moreComponent: component,
                },
            };
            // console.log(extParams);
            
            this.model.set({
                type: COMPONENT_TYPE_LAYOUT,
                style: form.layoutStyle.value,
                extParams: extParams,
            });

            var error = this.model.validate(this.model.attributes);
            if (error != '') {
                alert(error);
                return;
            }

            this.moduleModel.tempComponentList.add(this.model, {merge: true, remove: false, add: true});
            
            this.closeComponentDlg();
        },
        changeShowHeader: function () {
            $('.isShowStyleHeaderRadio')[0].checked ? $('.style-header-container').removeClass('hidden') : $('.style-header-container').addClass('hidden');
        },
        changeShowHeaderMore: function () {
            $('.isShowStyleHeaderMoreRadio')[0].checked ? $('.component-view-container').removeClass('hidden') : $('.component-view-container').addClass('hidden');
        },
    });
    
    // 自定义风格组件编辑框
    var CustomStyleComponentEditDlg = Backbone.View.extend({
        el: $("#custom-style-component-edit-dlg-view"),
        template: _.template($('#custom-style-component-edit-dlg-template').html()),
        events: {
            'click .style-component-close-btn': 'closeComponentDlg',
            'click .add-component-item-btn': 'addComponentItem',
            'submit .style-component-edit-form': 'submitStyleComponent',
            'change .layoutStyleSelect': 'onChangeComponentStyle',
        },
        render: function () {
            this.$el.html(this.template(this.model.attributes));
            this.onChangeComponentStyle();
            return this;
        },
        toggle: function () {
            this.$el.fadeToggle();
            toggleUICover();
        },
        closeComponentDlg: function () {
            this.toggle();
            this.$el.html('');
        },
        submitStyleComponent: function (event) {
            event.preventDefault();

            var form = $('.style-component-edit-form')[0];
            
            this.model.set({
                type: COMPONENT_TYPE_LAYOUT,
                style: form.layoutStyle.value,
            });

            this.model.attributes.componentList = submitComponentHelper(form);

            var error = this.model.validate(this.model.attributes);
            if (error != '') {
                alert(error);
                return;
            }

            this.styleModel.tempComponentList.add(this.model, {merge: true, remove: false, add: true});
            this.styleModel.attributes.componentList = this.styleModel.tempComponentList.models;
            
            this.closeComponentDlg();
        },
        addComponentItem: function () {
            event.preventDefault();
            
            var view = new ComponentView({model: new ComponentModel()});
            $('.component-view-container').append(view.render().el);
        },
        onChangeComponentStyle: function () {
            var layoutStyle = $('.layoutStyleSelect').val();
            var layoutModel = this.model.attributes.style == layoutStyle ? this.model : new ComponentModel({type: COMPONENT_TYPE_DEFAULT, style: layoutStyle});

            var componentList = [];
            if (layoutStyle == this.model.attributes.style) {
                componentList = this.model.attributes.componentList;
            } else {
                var size = 0;
                switch (layoutStyle) {
                    case COMPONENT_STYLE_LAYOUT_ONE_COL:
                    case COMPONENT_STYLE_LAYOUT_ONE_COL_HIGH:
                    case COMPONENT_STYLE_LAYOUT_ONE_COL_MID:
                    case COMPONENT_STYLE_LAYOUT_ONE_COL_LOW:
                        size = 1;
                        break;
                    case COMPONENT_STYLE_LAYOUT_TWO_COL:
                    case COMPONENT_STYLE_LAYOUT_TWO_COL_HIGH:
                    case COMPONENT_STYLE_LAYOUT_TWO_COL_MID:
                    case COMPONENT_STYLE_LAYOUT_TWO_COL_LOW:
                        size = 2;
                        break;
                    case COMPONENT_STYLE_LAYOUT_THREE_COL:
                    case COMPONENT_STYLE_LAYOUT_THREE_COL_HIGH:
                    case COMPONENT_STYLE_LAYOUT_THREE_COL_MID:
                    case COMPONENT_STYLE_LAYOUT_THREE_COL_LOW:
                    case COMPONENT_STYLE_LAYOUT_ONE_COL_TWO_ROW:
                        size = 3;
                        break;
                    case COMPONENT_STYLE_LAYOUT_FOUR_COL:
                    case COMPONENT_STYLE_LAYOUT_FOUR_COL_HIGH:
                    case COMPONENT_STYLE_LAYOUT_FOUR_COL_MID:
                    case COMPONENT_STYLE_LAYOUT_FOUR_COL_LOW:
                    case COMPONENT_STYLE_LAYOUT_ONE_COL_THREE_ROW:
                        size = 4;
                        break;
                    default:
                        size = 0;
                        break;
                }
                for (var i = 0; i < size; i++) {
                    componentList.push(new ComponentModel());
                }
            }
            $('.component-view-container').html('');
            for (var i = 0; i < componentList.length; i++) {
                var model = componentList[i];
                var view = new ComponentView({model: model});
                $('.component-view-container').append(view.render().el);
            }
        },
    });

    var ModuleEditDlg = Backbone.View.extend({
        el: $("#module-edit-dlg-view"),
        template: _.template($('#module-edit-template').html()),
        events: {
            'change #moduleType': 'onChangeModuleType',
            'submit .module-edit-form': 'moduleSubmit',
            'click .close-module-play' : 'closeModule',
            'click .more-fastpost-btn': 'selectFastpostItem',
            'click .close-fastpost-item-btn': 'closeSelectFastpostItem',
            'click .add-fastpost-item-btn': 'addFastpostItem',
        },
        render: function () {
            this.$el.html(this.template(this.model.attributes));
            this.onChangeModuleType();
            return this;
        },
        onChangeModuleType: function (event) {
            var moduleType = $('#moduleType').val();
            var moduleModel = this.model.attributes.type == moduleType ? this.model : new ModuleModel({type: moduleType});

            moduleEditDetailView.model = moduleModel;
            moduleEditDetailView.render();
            moduleEditMobileView.model = moduleModel;
            moduleEditMobileView.render();

            switch (moduleType) {
                case MODULE_TYPE_FULL:
                case MODULE_TYPE_SUBNAV:
                    var componentList = [];
                    size = moduleType == MODULE_TYPE_FULL ? 1 : SUBNAV_MAX_COMPONENT_LEN;
                    if (moduleModel.attributes.componentList.length == size) {
                        componentList = this.model.attributes.componentList;
                    } else {
                        for (var i = 0; i < size; i++) {
                            componentList.push(new ComponentModel());
                        }
                    }
                    for (var i = 0; i < componentList.length; i++) {
                        var model = componentList[i];
                        var view = new ComponentView({model: model});
                        $('.component-view-container').eq(i).html(view.render().el);
                    }
                    break;
                case MODULE_TYPE_FASTPOST:
                    _.each(this.model.attributes.componentList, function (component) {
                        var view = new ComponentView({model: component});
                        $('.fastpost-components-container').append(view.render().el);
                    });
                    break;
                case MODULE_TYPE_NEWS:
                    var componentList = [];
                    if (this.model.attributes.type == moduleType) {
                        componentList = this.model.attributes.componentList;
                    }
                    moduleModel.tempComponentList = new ComponentList();
                    this.listenTo(moduleModel.tempComponentList, 'add', moduleEditMobileView.addNewsComponentItem);
                    moduleModel.tempComponentList.set(componentList);
                    break;
                case MODULE_TYPE_CUSTOM:
                    var componentList = [];
                    if (this.model.attributes.type == moduleType) {
                        componentList = this.model.attributes.componentList;
                    }
                    moduleModel.tempComponentList = new ComponentList();
                    this.listenTo(moduleModel.tempComponentList, 'add', moduleEditMobileView.addCustomStyleItem);
                    moduleModel.tempComponentList.set(componentList)
                    break;
                default:
                    break;
            }
        },
        moduleSubmit: function (event) {
            event.preventDefault();

            var form = $('.module-edit-form')[0];
            var moduleType = form.moduleType.value;
            this.model.set({
                title: form.moduleTitle.value,
                type: moduleType,
            });

            switch (moduleType) {
                case MODULE_TYPE_FULL:
                case MODULE_TYPE_SUBNAV:
                case MODULE_TYPE_FASTPOST:
                    if (this.model.id != MODULE_ID_DISCOVER) {
                        this.model.attributes.componentList = submitComponentHelper(form);
                    }
                    break;
                case MODULE_TYPE_NEWS:
                case MODULE_TYPE_CUSTOM:
                    this.model.attributes.componentList = moduleEditMobileView.model.tempComponentList.models;
                    break;
                default:
                    break;
            }

            var error = this.model.validate(this.model.attributes);
            if (error != '') {
                alert(error);
                return;
            }

            if (this.model.isNew()) {
                this.model.set('id', this.model.getLastInsertId());
            }
            
            modules.add(this.model, {merge: true, remove: false, add: true});

            this.closeModule();
        },
        closeModule: function () {
            this.toggle();
            
            moduleEditMobileView.$el.html('');
        },
        selectFastpostItem: function () {
            event.preventDefault();

            $('.fastpost-item-select-div').removeClass('hidden');
            $('.more-fastpost-btn').addClass('hidden');
        },
        closeSelectFastpostItem: function () {
            $('.fastpost-item-select-div').addClass('hidden');
            $('.more-fastpost-btn').removeClass('hidden');
        },
        addFastpostItem: function () {
            var form = $('.module-edit-form')[0],
                type = $(form['fastpostItemSelect'])[0].value;
            
            var model = new ComponentModel({
                type: type,
            });

            var view = new ComponentView({model: model});
            $('.fastpost-components-container').append(view.render().el);
        },
        toggle: function () {
            this.$el.fadeToggle();
        },
    });
    
    var ModuleEditDetailView = Backbone.View.extend({
        template: _.template($('#module-edit-detail-template').html()),
        render: function () {
            $('#module-edit-detail-view').html(this.template(this.model.attributes));
            return this;
        },
    });

    var ModuleEditMobileView = Backbone.View.extend({
        el: $('#module-edit-mobile-view'),
        template: _.template($('#module-edit-mobile-template').html()),
        events: {
            'click .select-topbar-btn': 'selectTopbar',
            'click .add-news-component-item-btn': 'dlgAddNewsComponent',
            'click .add-style-btn': 'dlgAddStyleComponent',
        },
        initialize: function () { 
        },
        render: function () {
            this.$el.html(this.template(this.model.attributes));
            $('.carousel-example-generic_one').carousel();
            return this;
        },
        selectTopbar: function (event) {
            var index = $(event.currentTarget).index();
            var module = this.model.attributes;
            var componentModel = new ComponentModel();
            switch (index) {
                case 0:
                    if (module.leftTopbars.length > 0) {
                        componentModel = module.leftTopbars[0];
                    }
                    break;
                case 2:
                case 3:
                    if (module.rightTopbars.length > index - 2) {
                        componentModel = module.rightTopbars[index - 2];
                    }
                    break;
                default:
                    break;
            }
            moduleTopbarDlg.model = componentModel;
            moduleTopbarDlg.moduleModel = module;
            moduleTopbarDlg.render();
            moduleTopbarDlg.toggle();

            $('#topbarIndex').val(index);
        },
        dlgAddNewsComponent: function () {
            newsComponentEditDlg.model = new ComponentModel();
            newsComponentEditDlg.moduleModel = this.model;
            newsComponentEditDlg.render();
            newsComponentEditDlg.toggle();
        },
        addNewsComponentItem: function (component) {
            var view = new NewsComponentItemView({model: component});
            view.moduleModel = this.model;
            $('.news-component-item-container').append(view.render().el);
        },
        // 弹出添加风格区
        dlgAddStyleComponent: function () {
            var model = new ComponentModel(uidiyGlobalObj.layoutInitParams);
            model.attributes.extParams.styleHeader = {
                isShow: 1,
                title: '',
                position: 0,
                isShowMore: 1,
            };
            customStyleEditDlg.model = model;
            customStyleEditDlg.moduleModel = this.model;
            customStyleEditDlg.render();
            customStyleEditDlg.toggle();
        },
        // 添加风格区
        addCustomStyleItem: function (style) {
            var view = new CustomStyleItemView({model: style});
            view.moduleModel = this.model;
            $('.custom-style-item-container').append(view.render().el);
        },
    });
    
    var NewsComponentItemView = Backbone.View.extend({
        className: 'news-component-item',
        template: _.template($('#news-component-item-template').html()),
        events: {
            'click .edit-news-component-item-btn': 'dlgEditNewsComponent',
            'click .remove-news-component-item-btn': 'removeItem',
        },
        initialize: function () {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.remove);
        },
        render: function () {
            this.$el.html(this.template(this.model.attributes));
            return this;
        },
        dlgEditNewsComponent: function () {
            newsComponentEditDlg.model = this.model;
            newsComponentEditDlg.moduleModel = this.moduleModel;
            newsComponentEditDlg.render();
            newsComponentEditDlg.toggle();
        },
        removeItem: function () {
            this.model.destroy();
        },
    });

    // 自定义风格项视图
    var CustomStyleItemView = Backbone.View.extend({
        className: 'custom-style-item',
        template: _.template($('#custom-style-item-template').html()),
        events: {
            'click .edit-custom-style-item-btn': 'dlgEditCustomStyle',
            'click .add-style-component-btn': 'dlgAddStyleComponent',
            'click .remove-custom-style-item-btn': 'removeItem',
        },
        initialize: function () {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.remove);
        },
        render: function () {
            this.$el.html(this.template(this.model.attributes));

            this.model.tempComponentList = new ComponentList();
            this.listenTo(this.model.tempComponentList, 'add', this.addStyleComponentItem);
            this.model.tempComponentList.add(this.model.attributes.componentList, {merge: true, remove: false, add: true});

            return this;
        },
        dlgEditCustomStyle: function () {
            customStyleEditDlg.model = this.model;
            customStyleEditDlg.moduleModel = this.moduleModel;
            customStyleEditDlg.render();
            customStyleEditDlg.toggle();
        },
        // 弹出添加风格区内组件
        dlgAddStyleComponent: function () {
            customStyleComponentEditDlg.model = new ComponentModel(uidiyGlobalObj.layoutInitParams);
            customStyleComponentEditDlg.styleModel = this.model;
            customStyleComponentEditDlg.render();
            customStyleComponentEditDlg.toggle();
        },
        removeItem: function () {
            this.model.destroy();
        },
        addStyleComponentItem: function (component) {
            var view = new CustomStyleComponentItemView({model: component});
            view.styleModel = this.model;
            this.$el.find('.custom-style-component-item-container').append(view.render().el);
        },
    });
    
    // 自定义风格内组件项视图
    var CustomStyleComponentItemView = Backbone.View.extend({
        className: 'custom-style-component-item',
        template: _.template($('#custom-style-component-item-template').html()),
        events: {
            'click .edit-style-component-item-btn': 'dlgEditItem',
            'click .remove-style-component-item-btn': 'removeItem',
            'click .add-style-component-item-btn': '',
        },
        initialize: function () {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.remove);
        },
        render: function () {
            this.$el.html(this.template(this.model.attributes));
            return this;
        },
        dlgEditItem: function () {
            customStyleComponentEditDlg.model = this.model;
            customStyleComponentEditDlg.styleModel = this.styleModel;
            customStyleComponentEditDlg.render();
            customStyleComponentEditDlg.toggle();
        },
        removeItem: function () {
            this.model.destroy();
        },
    });

    var ModuleTopbarDlg = Backbone.View.extend({
        el: $('#module-topbar-dlg-view'),
        template: _.template($('#module-topbar-dlg-template').html()),
        events: {
            'submit .module-topbar-edit-form': 'submitTopbar',
            'click .close-topbar-btn': 'toggle',
        },
        render: function () {
            this.$el.html(this.template(this.model.attributes));
            return this;
        },
        submitTopbar: function () {
            event.preventDefault();

            var form = $('.module-topbar-edit-form')[0],
                type = form.topbarComponentType.value,
                index = parseInt(form.topbarIndex.value),
                model = new ComponentModel({type: type}),
                module = this.moduleModel;

            switch (index) {
                case 0:
                    if (type == COMPONENT_TYPE_DEFAULT) {
                        module.leftTopbars = [];
                    } else {
                        module.leftTopbars[0] = model;
                    }
                    break;
                case 2:
                    if (type == COMPONENT_TYPE_DEFAULT) {
                        module.rightTopbars.shift();
                    } else {
                        module.rightTopbars[0] = model;
                    }
                    break;
                case 3:
                    if (type == COMPONENT_TYPE_DEFAULT) {
                        module.rightTopbars.length > 1 && module.rightTopbars.pop();
                    } else {
                        module.rightTopbars[module.rightTopbars.length > 0 ? 1 : 0] = model;
                    }
                    break;
                default:
                    break;
            }

            this.toggle();
        },
        toggle: function () {
            this.$el.fadeToggle();
            toggleUICover();
        },
    });

    var ModuleRemoveDlg = Backbone.View.extend({
        el: $('#module-remove-dlg-view'),
        template: _.template($('#module-remove-template').html()),
        events: {
            'submit .module-remove-form': 'moduleSubmit',
        },
        render: function () {
            this.$el.html(this.template(this.model.attributes));
            return this;
        },
        moduleSubmit: function (event) {
            event.preventDefault();

            this.model.destroy();

            $('.module-remove-dlg').modal('hide');
        },
    });

    var NavItemEditDlg = Backbone.View.extend({
        el: $("#navitem-edit-dlg-view"),
        template: _.template($('#navitem-edit-template').html()),
        events: {
            'submit .navitem-edit-form': 'submitNavItem',
            'click .add-nav-close' : 'toggle',
        },
        render: function () {
            this.$el.html(this.template(this.model.attributes));
            return this;
        },
        submitNavItem: function (event) {
            event.preventDefault();

            var form = $('.navitem-edit-form')[0];
            
            this.model.set({
                title: form.navItemTitle.value,
                moduleId: parseInt(form.navItemModuleId.value),
                // icon: '',
            });

            var error = this.model.validate(this.model.attributes);
            if (error != '') {
                alert(error);
                return;
            }

            navItems.add(this.model, {merge: true, remove: false, add: true});

            this.toggle();
        },
        toggle: function () {
            this.$el.fadeToggle();
            toggleUICover();
        },
    });

    var NavItemRemoveDlg = Backbone.View.extend({
        el: $("#navitem-remove-dlg-view"),
        template: _.template($('#navitem-remove-template').html()),
        events: {
            'submit .navitem-remove-form': 'submitNavItem',
            'click .btn-remove-navitem' : 'toggle',
        },
        render: function () {
            this.$el.html(this.template(this.model.attributes));
            return this;
        },
        submitNavItem: function (event) {
            event.preventDefault();
            this.model.destroy();
            this.toggle();
        },
        toggle: function () {
            this.$el.fadeToggle();
            toggleUICover();
        },
    });

    var MainView = Backbone.View.extend({
        el: $("#uidiy-main-view"),
        events: {
            'click .module-add-btn': 'dlgAddModule',
            'click .module-remove-btn': 'dlgRemoveModule',
            'click .navitem-add-btn': 'dlgAddNavItem',
            'click .uidiy-sync-btn': 'uidiySync',
            'click .uidiy-init-btn': 'uidiyInit',
        },
        initialize: function() {
            this.listenTo(modules, 'add', this.addModule);
            this.listenTo(navItems, 'add', this.addNavItem);

            // 转换module, component对象
            _.each(uidiyGlobalObj.moduleInitList, function (module) {
                var tmpComponentList = [],
                    tmpLeftTopbars = [],
                    tmpRightTopbars = [];
                _.each(module.componentList, function (component) {
                    tmpComponentList.push(wrapComponent(component));
                });
                _.each(module.leftTopbars, function (component) {
                    tmpLeftTopbars.push(wrapComponent(component));
                });
                _.each(module.rightTopbars, function (component) {
                    tmpRightTopbars.push(wrapComponent(component));
                });
                module.componentList = tmpComponentList;
                module.leftTopbars = tmpLeftTopbars;
                module.rightTopbars = tmpRightTopbars;
                modules.add(new ModuleModel(module));
            })

            navItems.set(uidiyGlobalObj.navItemInitList);
        },
        render: function () {
            return this;
        },
        addModule: function (module) {
            var view = new ModuleView({model: module});
            $('.last-module').before(view.render().el);
        },
        addNavItem: function (navItem) {
            var view = new NavItemView({model: navItem});
            $('.navitem-add-btn').before(view.render().el);   
        },
        dlgAddNavItem: function () {
            navItemEditDlg.model = new NavItemModel();
            navItemEditDlg.render();
            navItemEditDlg.toggle();
        },
        dlgAddModule: function (event) {
            moduleEditDlg.model = new ModuleModel();
            moduleEditDlg.render();
            moduleEditDlg.toggle();
        },
        dlgRemoveModule: function (event) {
            var moduleId = $(event.currentTarget).parents('div.module')[0].id.slice(10);
            moduleRemoveDlg.model = modules.get(moduleId);
            moduleRemoveDlg.render();
        },
        uidiySync: function (event) {
            Backbone.ajax({
                url: uidiyGlobalObj.rootUrl + '/index.php?r=admin/uidiy/savemodules',
                type: 'post',
                dataType: 'json',
                data: {
                    modules: JSON.stringify(modules),
                },
                success: function (result,status,xhr) {
                    var navInfo = {
                        type: NAV_TYPE_BOTTOM,
                        navItemList: navItems,
                    };
                    Backbone.ajax({
                        url: uidiyGlobalObj.rootUrl + '/index.php?r=admin/uidiy/savenavinfo',
                        type: 'post',
                        dataType: 'json',
                        data: {
                            navInfo: JSON.stringify(navInfo),
                        },
                        success: function (result,status,xhr) {
                            alert('同步成功');
                        }
                    });
                }
            });
        },
        uidiyInit: function () {
            Backbone.ajax({
                url: uidiyGlobalObj.rootUrl + '/index.php?r=admin/uidiy/init',
                type: 'post',
                success: function (result,status,xhr) {
                    alert('初始化成功');
                    location.href = uidiyGlobalObj.rootUrl + '/index.php?r=admin/uidiy';
                }
            });
        }
    });

    var mainView = new MainView(),
        navItemEditDlg = new NavItemEditDlg(),
        navItemRemoveDlg = new NavItemRemoveDlg(),
        moduleEditDlg = new ModuleEditDlg(),
        moduleTopbarDlg = new ModuleTopbarDlg(),
        newsComponentEditDlg = new NewsComponentEditDlg(),
        customStyleEditDlg = new CustomStyleEditDlg(),
        customStyleComponentEditDlg = new CustomStyleComponentEditDlg(),
        moduleEditDetailView = new ModuleEditDetailView(),
        moduleEditMobileView = new ModuleEditMobileView(),
        moduleRemoveDlg = new ModuleRemoveDlg();

    window.Appbyme = {
        uiModules: modules,
    }
});
