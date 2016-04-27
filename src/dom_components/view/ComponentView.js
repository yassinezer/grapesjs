define(['backbone', './ComponentsView'],
	function (Backbone, ComponentsView) {

		return Backbone.View.extend({

			className : function(){ 						//load classes from model
				return this.getClasses();
			},

			tagName: function(){ 							//load tagName from model
				return this.model.get('tagName');
			},

			initialize: function(opt){
				this.config			= opt.config || {};
				this.pfx				= this.config.stylePrefix;
				this.components = this.model.get('components');
				this.attr				= this.model.get("attributes");
				this.classe			= this.attr.class || [];
				this.listenTo(this.model, 'destroy remove', 	this.remove);
				this.listenTo(this.model, 'change:style', 		this.updateStyle);
				this.listenTo(this.model, 'change:attributes', this.updateAttributes);
				this.listenTo(this.model, 'change:status', 		this.updateStatus);
				this.listenTo(this.model, 'change:state', 		this.updateState);
				this.listenTo(this.model.get('classes'), 'add remove change', this.updateClasses);
				this.$el.data("model", this.model);
				this.$el.data("model-comp", this.components);

				if(this.model.get('classes').length)
					this.importClasses();
			},

			/**
			 * Import, if possible, classes inside main container
			 * @private
			 * */
			importClasses: function(){
				var clm = this.config.em.get('ClassManager');

				if(clm){
					this.model.get('classes').each(function(m){
							clm.addClass(m.get('name'));
					});
				}
			},

			/**
			 * Fires on state update. If the state is not empty will add a helper class
			 * @param	{Event} e
			 * @private
			 * */
			updateState: function(e){
				var cl = 'hc-state';
				var state = this.model.get('state');

				if(state){
					this.$el.addClass(cl);
				}else{
					this.$el.removeClass(cl);
				}
			},

			/**
			 * Update item on status change
			 * @param	{Event} e
			 * @private
			 * */
			updateStatus: function(e){
				var s		= this.model.get('status'),
						pfx	= this.pfx;
				switch(s) {
				    case 'selected':
				    	this.$el.addClass(pfx + 'selected');
				        break;
				    case 'moving':
				        break;
				    default:
				    	this.$el.removeClass(pfx + 'selected');
				}
			},

			/**
			 * Get classes from attributes.
			 * This method is called before initialize
			 *
			 * @return	{Array}|null
			 * @private
			 * */
			getClasses: function(){
				var attr	= this.model.get("attributes"),
					classes	= attr['class'] || [];
				if(classes.length){
					return classes.join(" ");
				}else
					return null;
			},

			/**
			 * Update attributes
			 *
			 * @return void
			 * @private
			 * */
			updateAttributes: function(){
				var attributes	= {},
					attr		= this.model.get("attributes");
				for(var key in attr) {
					  if(attr.hasOwnProperty(key))
					    attributes[key] = attr[key];
				}
				// Update src
				if(this.model.get("src"))
					attributes.src = this.model.get("src");

				attributes.style = this.getStyleString();

				this.$el.attr(attributes);
			},

			/**
			 * Update style attribute
			 *
			 * @return void
			 * @private
			 * */
			updateStyle: function(){
				this.$el.attr('style', this.getStyleString());
			},

			/**
			 * Return style string
			 *
			 * @return	{String}
			 * @private
			 * */
			getStyleString: function(){
				var style	= '';
				this.style	= this.model.get('style');
				for(var key in this.style) {
					  if(this.style.hasOwnProperty(key))
						  style += key + ':' + this.style[key] + ';';
				}

				return style;
			},

			/**
			 * Update classe attribute
			 * @private
			 * */
			updateClasses: function(){
				var str = '';

				this.model.get('classes').each(function(model){
					str += model.get('name') + ' ';
				});

				this.$el.attr('class',str.trim());

				// Regenerate status class
				this.updateStatus();
			},

			/**
			 * Reply to event call
			 * @param object Event that generated the request
			 * @private
			 * */
			eventCall: function(event){
				event.viewResponse = this;
			},

			render: function() {
				this.updateAttributes();
				this.updateClasses();
				this.$el.html(this.model.get('content'));
				var view = new ComponentsView({
					collection	: this.components,
					config		: this.config,
				});
				this.$components = view;

				// With childNodes lets avoid wrapping 'div'
				this.$el.append(view.render(this.$el).el.childNodes);
				return this;
			},

		});
});
