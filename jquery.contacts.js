; (function ($, window, document, undefined) { //jshint ignore

    if(!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(needle) {
            for(var i = 0; i < this.length; i++) {
                if(this[i] === needle) {
                    return i;
                }
            }
            return -1;
        };
    }

    /*
     * This widget will be generated in such format (you define only outer div):
     * <div id="contactsContainer">
     *      <div class="filter">
     *         <a class="all" href="#">All</a>
     *         <a href="#" class="filter" data-filter="group1">Group1</a>
     *         <a class="filter" href="#" data-filter="group2">Group2</a>
     *      </div>
     *      <div class="contacts">
     *      </div>
     *  </div>
     * Important class: all, filter. Property data-filter.
     * 
     * Expected json result data:
     * [ { "name": "LastName, FirstName",
     *     "con_position": "position",
     *     "image": "image_url",
     *     "misc": "additional info",
     *     "metakey": "{ 'groups': [ 'group1', 'group2' ] }"
     *   } ]
     */
    $.widget('seprodecon.contacts',  {

        options: {
            dataUrl: null,
            allText: 'Wszyscy',
            filterGroups: null
        },

        _create: function () {
            if (this.options.dataUrl === null) {
                return;
            }

            if (this.options.filterGroups !== null) {
                this._generateFilters();
            }
			
			this.element.append($('<div>').addClass('contacts'));

			this._assignEvents();
			
            this._retrieveData();
        },

        _destroy: function () {
        },
		
		_assignEvents: function() {
			var self = this;
			this.element.find('a.all').click(function() {	
				self.element.find('a.filter').removeClass('selected');
				self.element.data('filter', []);
				self._refreshContactsFilter();
			});
			
			this.element.find('a.filter').click(function() {
				var currentFilter = self.element.data('filter');
				if (currentFilter === undefined || currentFilter === null) {
					currentFilter = [];
				}
		
				var selVal = $(this).data('filter');
				if ($(this).hasClass('selected')) {
					//remove
					for (var i=0;i<currentFilter.length; i++) {
						if (currentFilter[i] === selVal) {
							currentFilter.splice(i, 1);
						}
					}
			
					$(this).removeClass('selected');
				} else {
					//add			
					var exists = false;
					for (var i=0;i<currentFilter.length; i++) {
						if (currentFilter[i] === selVal) {
							exists = true;
							break;
						}
					}
					if (!exists) {
						currentFilter.push(selVal);
					}
		
					$(this).addClass('selected');
				}
		
				self.element.data('filter', currentFilter);
				self._refreshContactsFilter();
			});
		},

        _generateFilters: function() {
            var filterDiv = $('<div>').addClass('filters');
            var all = $('<a>').addClass('all').text(this.options.allText);
            filterDiv.append(all);

            for (var i=0;i<this.options.filterGroups.length; i++) {
                var filterGroup = this.options.filterGroups[i];
                var filter = $('<a>').addClass('filter').attr('data-filter', filterGroup.filter).text(filterGroup.name);
                filterDiv.append(filter);
            }            
			this.element.append(filterDiv);
        },

        _retrieveData: function() {
            var self = this;
            $.ajax({
				url: this.options.dataUrl,
				dataType: 'json',
				success: function(data) { self._generateContacts(data); },
				error: function() { self.element.append($('<div>').addClass('error').text('Brak kontaktów')); }
			});
        },

        _generateContacts: function(data) {
            for (var i=0; i<data.length; i++) {
                var contact = data[i];
    
                var cdiv = $('<div>').addClass('contact');
                
                var name = $('<span>').addClass('name').text(contact.name);
                cdiv.append(name);
                
                var position = $('<span>').addClass('position').text(contact.con_position);
                if (contact.con_position) {
                    cdiv.append(position);
                }
                
                var image = $('<img>').attr('src', contact.image);
                if (contact.image) {
                    cdiv.append(image);
                }
                
                var misc = contact.misc;
                if (misc) {
                    cdiv.append(misc);
                }				
                
                if (contact.metakey !== '') {
                    var meta = JSON.parse(contact.metakey);
                    if (meta != undefined && meta.groups != undefined) {
                        cdiv.data('groups', meta.groups);
                    }
                }
                this.element.find('.contacts').append(cdiv);
            }
            
            this._refreshContactsFilter();
        },

		_refreshContactsFilter: function() {
			var currentFilter = this.element.data('filter');
			if (currentFilter === undefined || currentFilter === null) {
				currentFilter = [];
			}
		
			this.element.find('.contacts > .contact').each(function() {
				var cdiv = $(this);
				
				if (currentFilter.length === 0) {
					cdiv.show();
				} else {
					var assignedGroups = cdiv.data('groups');
					var shouldShow = false;
					if (assignedGroups !== undefined && assignedGroups !== null) {
						for (var i=0; i<assignedGroups.length; i++) {
							if (currentFilter.indexOf(assignedGroups[i]) > -1) {
								shouldShow = true;
								break;
							}
						}
					}
					cdiv.toggle(shouldShow);
				}			
			});		
		}
    });

})(jQuery);




