ShareApp.controller("TaskManagementController", ["$scope", "$http", "$rootScope", "$uibModal", "$timeout", "SharewebListService", "SharewebCommonFactoryService", "GlobalConstants",
function ($scope, $http, $rootScope, $uibModal, $timeout, SharewebListService, SharewebCommonFactoryService, GlobalConstants) {
    $scope.baseUrl = GlobalConstants.MAIN_SITE_URL;
    $scope.userId = _spPageContextInfo.userId;
    $scope.globalSearch = '';
    $scope.orderBy = 'Created';
    $scope.reverse = true;
    $scope.selectedReferenceItem = '';
    $scope.userIds = [];
    //  $scope.siteurl = GlobalConstants.EI_SITE_URL;
    $scope.listId = GlobalConstants.EI_TASK_LISTID
    $scope.isSiteOwner = function () {
        SharewebCommonFactoryService.IsCurrentUserSiteOwner()
        .then(function (IsSiteAdmin) {
            $scope.isOwner = IsSiteAdmin;
        });
    }
    $scope.isSiteOwner();
    $scope.ConvertDateTimeWithServerZone = function (dDate, format) {
        if (dDate != undefined) {
            return SharewebCommonFactoryService.ConvertLocalTOServerDate(dDate, format);
        }
    }

    $scope.changeGroupBy = function (group) {
        $scope.gridOptions.groupBy(group);
    }
    $scope.clearAll = function (cntrlId) {
        $scope.SmartDocumentSearch = "";
        $scope.AllReferences = [];
    };

    $('#addstartDatePicker').datetimepicker({
        timepicker: false,
        format: 'd/m/Y',
        scrollMonth: false,
        scrollTime: false,
        scrollInput: false,
        onChangeDateTime: function (dp, $input) {
            $scope.task.StartDate = $input.val();
        }

    });
    $('#adddueDatePicker').datetimepicker({
        timepicker: false,
        format: 'd/m/Y',
        scrollMonth: false,
        scrollTime: false,
        scrollInput: false,
        onChangeDateTime: function (dp, $input) {
            $scope.task.DueDate = $input.val();
        }
    });

    $scope.clearControl = function (cntrlId) {
        $('#' + cntrlId).val('');
        switch (cntrlId) {
			case 'searchTitle':
				$scope.searchTitle = undefined;
                break;
            case 'searchAssignedTo':
				$scope.searchAssignedTo = undefined;
                break;
            case 'searchAuthor':
				$scope.searchAuthor = undefined;
                break;

            case 'searchPriority':
				$scope.searchPriority = undefined;
                break;
            case 'searchCategory':
				$scope.searchCategory = undefined;
                break;

        }

    };
    $scope.ClearFilters = function () {
		$scope.searchTitle = undefined;
		$scope.searchAssignedTo = undefined;
		$scope.searchAuthor = undefined;
		$scope.globalSearch = undefined;
		$scope.searchPriority = undefined;
		$scope.searchCategory = undefined;
        //$scope.searchCreated = '';
        //$scope.searchDuedate = '';
    }
    $scope.filterAssignedTo = function (item) {
        if ($scope.searchAssignedTo == null || $scope.searchAssignedTo == undefined || $scope.searchAssignedTo == '')
            return true;
        else if (item.AssignedTo != undefined && item.AssignedTo.results != undefined && item.AssignedTo.results.length > 0) {
            var isUserExists = false;
            angular.forEach(item.AssignedTo.results, function (user) {
                if (user.Title.toLowerCase().indexOf($scope.searchAssignedTo.toLowerCase()) > -1)
                    isUserExists = true;
            })
            return isUserExists;
        }
    };
    $scope.filterAuthor = function (item) {
        if ($scope.searchAuthor == null || $scope.searchAuthor == undefined || $scope.searchAuthor == '')
            return true;
        else if (item.Author.Title.toLowerCase().indexOf($scope.searchAuthor.toLowerCase()) > -1) {
            return true;
        }
        else
            return false;
    }
    $scope.filterDuedate = function (item) {
        if ($scope.searchDuedate == null || $scope.searchDuedate == undefined || $scope.searchDuedate == '')
            return true;
        else if (item.TaskDueDate != undefined) {
            if (item.TaskDueDate.indexOf($scope.searchDuedate) > -1)
                return true;
        }
    };
    $scope.filterCreatedDate = function (item) {
        if ($scope.searchCreated == null || $scope.searchCreated == undefined || $scope.searchCreated == '')
            return true;
        else if (item.CreatedDate != undefined) {
            if (item.CreatedDate.indexOf($scope.searchCreated) > -1)
                return true;
        }
    };

    $scope.getListId = function () {
        SharewebListService.getRequest(GlobalConstants.ADMIN_SITE_URL, "/getbyid('" + $scope.listId + "')")
        .then(function (data) {
            $scope.currentListGUID = data.d.Id;

        }, function (error) {
            alert('Error: ' + error.result);
        });
    };
    $scope.getListId();
    $scope.loadTaskCategories = function () {
        SharewebListService.getRequest(GlobalConstants.ADMIN_SITE_URL, "/getbyid('" + GlobalConstants.ADMIN_TASK_USERS_LISTID + "')/items")
           .then(function (data) {
               $scope.Categories = data.d.results;

               console.log($scope.Categories);
           },
         function (error) {
             alert(JSON.stringify(data));

         });
    };
    $scope.loadTaskCategories();
    $scope.createCategories = function (userId) {
        if ($scope.userIds.indexOf(userId) > -1) {
            $scope.userIds.splice($scope.userIds.indexOf(userId), 1);
        }
        else
            $scope.userIds[$scope.userIds.length] = userId;
    };
    $scope.editCategories = function (userId) {
        if ($scope.userIds.indexOf(userId) > -1) {
            $scope.userIds.splice($scope.userIds.indexOf(userId), 1);
        }
        else
            $scope.userIds[$scope.userIds.length] = userId;
    };
    $scope.getUserShortName = function (item) {
        var users = '';
        var isuserexists = false;
        var userarray = angular.copy(item.AssignedTo.results);
        for (var i = 0; i < userarray.length; i++) {
            angular.forEach($scope.Categories, function (user) {
                if (userarray[i].Id == user.AssingedToUserId) {
                    users += user.Title + ',';
                    isuserexists = true;
                    return false;
                }
            });
            if (!isuserexists)
                users += userarray[i].Title + ',';
        }
        return users;
    }
    $scope.selectSiteType = function () {
        var site = $scope.value;
        switch (site) {
            case ('EI Task'):
                $scope.listId = GlobalConstants.EI_TASK_LISTID;
                //   $scope.sitemetadata = "SP.Data.EIListItem"
                $scope.ListType = "ei";
                break;
            case ('Gender Task'):
                $scope.listId = GlobalConstants.GENDER_TASK_LISTID;
                //   $scope.sitemetadata = "SP.Data.GenderListItem"
                $scope.ListType = "gender";
                break;
        }
        if (site != undefined && site != "") {
            SharewebCommonFactoryService.showProgressBar('sharewebprogressbar');
            $scope.loadTasks();
        }
        else (site == "")
        {
            $scope.Tasks = [];
            $scope.MyTasks = [];
            $scope.MyCreatedTasks = [];
            $scope.PendingTasks = [];
            $scope.CompletedTasks = [];
        }
	}
	//for getting Multiple Users From People Picker Coloumn
	$scope.getMultiUserValues = function (item) {
		var users = '';
		var isuserexists = false;
		var userarray = [];
		if (item.AssignedTo != undefined && item.AssignedTo.results != undefined)
			userarray = angular.copy(item.AssignedTo.results);
		for (var i = 0; i < userarray.length; i++) {
			angular.forEach($scope.Categories, function (user) {
				if (userarray[i].Id == user.AssingedToUserId) {
					users += user.Title + ', ';
					isuserexists = true;
					return false;
				}
			});
			if (!isuserexists)
				users += userarray[i].Title + ', ';
		}
		if (users.length > 0)
			users = users.slice(0, -2);
		return users;
	};
    //End of Getting Multiple Users
    // Start of Get Data from List into View
    $scope.loadTasks = function () {
        $scope.MyTasks = [];
        $scope.MyCreatedTasks = [];
        $scope.PendingTasks = [];
        $scope.CompletedTasks = [];
		SharewebListService.getRequest(GlobalConstants.ADMIN_SITE_URL, "/getbyid('" + $scope.listId + "')/items?$select=AssignedTo/Title,AssignedTo/Name,AssignedTo/Id,AttachmentFiles/FileName,FileLeafRef,Title,Id,Company,StartDate,DueDate,Status,Body,Mileage,PercentComplete,Attachments,FeedBack,Priority,Created,Modified,Author/Id,Author/Title,Editor/Id,Editor/Title&$expand=AssignedTo,AttachmentFiles,Author,Editor&$orderby=Created desc&$top=4999")
         .then(function (data) {
             $scope.Tasks = data.d.results;
             $scope.metadata = data.d.results[0].__metadata.type;
             console.log($scope.Tasks);
             if ($scope.Tasks != null)
                 angular.forEach($scope.Tasks, function (item) {
                     if (item.DueDate != undefined && item.Status != 'Completed') {
                         var start = new Date();
                         var end = new Date(item.DueDate);
                         var diff = new Date(end - start);
                         var days = Math.round(diff / 1000 / 60 / 60 / 24);
                         if (days < 0) {
                             item.class = "overdue";
                         }
                     }
                     if (item.Priority.indexOf('High') > -1)
                         item.class = "highpriority";
                     if (item.Priority.indexOf('Low') > -1)
                         item.class = "lowpriority";
                     //$scope.getFieldHistory(item, 'Comments', 'DemoTask');
                     if (item.StartDate != null)
                         item.StartDate = new Date(item.StartDate).format('dd/MM/yyyy');
                     if (item.DueDate != null)
                         item.TaskDueDate = new Date(item.DueDate).format('dd/MM/yyyy');
                     $scope.Attachments = item.Attachments;
                     item.CreatedDate = new Date(item.Created).format('dd/MM/yyyy');
                     item.DateCreated = new Date(item.Created).format('dd/MM/yyyy HH:mm');
                     item.Modified = new Date(item.Modified).format('dd/MM/yyyy HH:mm');
                     item.assigned = $scope.getMultiUserValues(item);
                     if (item.Status == 'Completed')
                         $scope.CompletedTasks.push(item);
                     else
                         $scope.PendingTasks.push(item);
                     if ($scope.IsMyTask(item))
                         $scope.MyTasks.push(item);
                     if (_spPageContextInfo.userId == item.Author.Id)
                         $scope.MyCreatedTasks.push(item);
                     $scope.tempcategories = [];
                     //$scope.tempcategories.push(item.Company)
                     if ($scope.tempcategories.indexOf(item.Company) == -1) {
                         $scope.tempcategories.push(item.Company);
                     }

                 });
             console.log($scope.PendingTasks);
             $scope.AllTasks = data.d.results;
             console.log($scope.Tasks);
             SharewebCommonFactoryService.hideProgressBar('sharewebprogressbar');
         },
         function (error) {
             SharewebCommonFactoryService.WriteLog("SPAngCorporateAlertsController->Save", "Error", JSON.stringify(error), "Add New");
             alert('Error: ' + error.result);
         });

    };


    $scope.gridOptions = {
        data: 'Tasks',
        showGroupPanel: true,
        jqueryUIDraggable: true,
        enableColumnResize: true,
        groups: ['Company'],
        columnDefs: [{ field: 'Company', displayName: 'Category' }, { field: 'Title', displayName: 'Task Name' }, { field: 'assigned', displayName: 'Assigned To', cellTemplate: '<div class="ngCellText" title="{{row.getProperty(col.field)}}">{{row.getProperty(col.field)}}</div>' }, { field: 'DueDate', displayName: 'Due Date' }, { field: 'Status', displayName: 'Status' }, { field: 'Priority', displayName: 'Priority' }]
    };
    $scope.IsMyTask = function (item) {
        var flag = false;
        angular.forEach(item.AssignedTo.results, function (user) {
            if (user.Id == _spPageContextInfo.userId && item.Status != 'Completed') {
                flag = true;
                return false;
            }
        });
        return flag;
    }
    // $scope.loadTasks();
    // End of Get Data from List into View
    

    // sorting based on clicking header
    $scope.reverseSort = false;
    $scope.sortData = function (column) {
        $scope.reverseSort = ($scope.sortColumn == column) ? !$scope.reverseSort : false;
        $scope.sortColumn = column;
    }

    $scope.getSortedArrow = function (column) {
        if ($scope.sortColumn == column)
            return $scope.reverseSort;
    }
    $scope.getCommentsForDisplay = function (item) {
        $("#comment_" + item.Id).html(item.Body);
    }
    $scope.editcomment = function (reply) {
        if (reply.Body.indexOf('<div') > -1)
            reply.Body = angular.element(reply.Body).text();
        reply.editable = true;
        $scope.oldComment = reply.Body;
    }
    $scope.cancelComment = function (reply) {
        reply.editable = false;
        reply.Body = $scope.oldComment;
    }

    $scope.showaddNewTaskPopUp = function () {
        $('#addNewTasks').show();
    };
    $scope.ReferenceItem = function () {
        $('#ReferencePopUp').show();
    };
    $scope.RemoveReferenceItem = function () {
        $scope.Mileage = {};
    }
    $scope.CreateDiscussion = function (title, itemId) {
        var item = {
            "__metadata": { "type": "SP.Data.TasksCommentsListItem" },
            "Title": title,
            "LinkedItemId": itemId,
            "ListType": $scope.ListType
        };
        SharewebListService.AddListItemByListId(GlobalConstants.ADMIN_SITE_URL, GlobalConstants.Admin_TASKS_COMMENTS_LISTID, item)
            .then(function (response) {

            }, function (error) {
                SharewebCommonFactoryService.WriteLog("AdminTaskManagementController CreateDiscussion->Save", "Error", JSON.stringify(error), "Add New");
                //alert('Error: ' + error.result);
            });
    };
    //Start of adding new Task
    $scope.addNewTask = function () {
        var item = {
            "__metadata": { "type": $scope.metadata },
            "Title": $scope.task.Title,
        };

        SharewebListService.AddListItemByListId(GlobalConstants.ADMIN_SITE_URL, $scope.listId, item)
          .then(function (response) {
              var itemId = response.d.Id;
              var item = response.d;
              $scope.CreateDiscussion($scope.task.Title, itemId);
              $('#addNewTasks').hide();
              $scope.loadTasks();
              $scope.EditTask(item);
          }, function (error) {
              //SharewebCommonFactoryService.WriteLog("SPAngCorporateAlertsController->Save", "Error", JSON.stringify(error), "Add New");
              // alert('Error: ' + error.result.error.message.value);
          });

    };
    // End of display attached file popup

    $scope.inlineEditDetails = function (item, tab) {
        item.editable = true;
        $scope.oldCompany = item.Company;
        $scope.oldTitle = item.Title;
        $scope.oldStatus = item.Status;
        $scope.oldTaskDueDate = item.TaskDueDate;
        $scope.oldTaskPriority = item.Priority;
        switch (tab) {
            case 'AllTasks':
                $('#InlinedueDatePicker_AllTasks_' + item.Id).datetimepicker({
                    timepicker: false,
                    format: 'd/m/Y',
                    scrollMonth: false,
                    scrollTime: false,
                    scrollInput: false,
                    onChangeDateTime: function (dp, $input) {
                        $scope.inlineDueDate = $input.val();
                    }
                });
                break;
            case 'MyTasks':
                $('#InlinedueDatePicker_MyTasks_' + item.Id).datetimepicker({
                    timepicker: false,
                    format: 'd/m/Y',
                    scrollMonth: false,
                    scrollTime: false,
                    scrollInput: false,
                    onChangeDateTime: function (dp, $input) {
                        $scope.inlineDueDate = $input.val();
                    }
                });
                break;
            case 'CreatedByMe':
                $('#InlinedueDatePicker_CreatedByMe_' + item.Id).datetimepicker({
                    timepicker: false,
                    format: 'd/m/Y',
                    scrollMonth: false,
                    scrollTime: false,
                    scrollInput: false,
                    onChangeDateTime: function (dp, $input) {
                        $scope.inlineDueDate = $input.val();
                    }
                });
                break;
            case 'PendingTasks':
                $('#InlinedueDatePicker_PendingTasks_' + item.Id).datetimepicker({
                    timepicker: false,
                    format: 'd/m/Y',
                    scrollMonth: false,
                    scrollTime: false,
                    scrollInput: false,
                    onChangeDateTime: function (dp, $input) {
                        $scope.inlineDueDate = $input.val();
                    }
                });
                break;
            case 'CompletedTasks':
                $('#InlinedueDatePicker_CompletedTasks_' + item.Id).datetimepicker({
                    timepicker: false,
                    format: 'd/m/Y',
                    scrollMonth: false,
                    scrollTime: false,
                    scrollInput: false,
                    onChangeDateTime: function (dp, $input) {
                        $scope.inlineDueDate = $input.val();
                    }
                });
                break;
        }

    }
    $scope.SaveItem = function (item) {
        if ($scope.inlineDueDate != undefined) {
            var DueDates = $scope.inlineDueDate.split("/");
            var taskdueDate = new Date(parseInt(DueDates[2], 10),
                              parseInt(DueDates[1], 10) - 1,
                              parseInt(DueDates[0], 10));
        }
        else
            taskdueDate = null;
        var postData = {
            __metadata: { "type": $scope.metadata },
            Id: item.Id,
            Title: item.Title,
            Status: item.Status,
            DueDate: taskdueDate,
            Company: item.Company,
            Priority: item.Priority

        };
        SharewebListService.UpdateListItemByListId(GlobalConstants.ADMIN_SITE_URL, $scope.listId, postData, item.Id)
         .then(function (response) {
             $scope.loadTasks();
             $scope.$apply()
         }, function (error) {
             SharewebCommonFactoryService.WriteLog("SPAngCorporateAlertsController->Save", "Error", JSON.stringify(error), "Add New");
             alert('Error: ' + error.result);
         });


    }

    $scope.CancelItem = function (item) {
        item.editable = false;
        item.Company = $scope.oldCompany;
        item.Title = $scope.oldTitle;
        item.Status = $scope.oldStatus;
        item.TaskDueDate = $scope.oldTaskDueDate;
        item.Priority = $scope.oldTaskPriority;
        
    }
    $scope.cancelItemAdd=function()
    {
      //  $scope.task.Title = '';
        $('#addNewTasks').hide();
    }
    $scope.loadAllDiscussions = function () {
        var expand = 'Folder/ItemCount'
        var select = 'Id,LinkedItemId,ParentItemID,Title,Folder/ItemCount';
        SharewebListService.getRequest(GlobalConstants.ADMIN_SITE_URL, "/getbyId('" + GlobalConstants.Admin_TASKS_COMMENTS_LISTID + "')/items?$select=" + select + "&$expand=" + expand + "&$top=4999")
                 .then(function (data) {
                     $scope.discussions = data.d.results;
                 },
                 function (error) {
                     //alert('Error: ' + error.result);
                 });

    }
    $scope.loadAllDiscussions();

    $scope.getTaskComments = function (item) {
        // $scope.loadDiscussion(item);
        var count = 0;
        angular.forEach($scope.discussions, function (discussion) {
            if (item.Id == parseInt(discussion.LinkedItemId)) {
                count = discussion.Folder.ItemCount;
                item.Repliescount = discussion.Folder.ItemCount;
                return false;
            }
        });
        return count;
    }
	$scope.EditTask = function (item) {
		   $rootScope.modalInstance = $uibModal.open({
            templateUrl: _spPageContextInfo.siteAbsoluteUrl + '/Style%20Library/js/angular/Templates/HCTaskManagement.html',
            controller: 'HCTaskManagementController',
            backdrop: "static",
            size: 'lg'
        });
        $rootScope.modalInstance.itemId = item.Id;
        $rootScope.modalInstance.listId = $scope.listId;
    };
    $scope.$on('refreshTaskManagement', function () {
        $scope.loadTasks();
	})
	$scope.openFeedBack = function () {
		$scope.DescriptionFields = [];
		var textField = {};
		textField.Title = '';
		$scope.DescriptionFields.push(textField);
		textField = {};
		textField.Title = '';
		$scope.DescriptionFields.push(textField);
		textField = {};
		textField.Title = '';
		$scope.DescriptionFields.push(textField);
		textField = {};
		textField.Title = '';
		$scope.DescriptionFields.push(textField);
		textField = {};
		textField.Title = '';
		$scope.DescriptionFields.push(textField);
		
		$scope.FeedBackDetails = [];
		$('#FeedBackPic').summernote({
			toolbar: [

			],
			width: 500,
			minHeight: 200,
			maxHeight: 200
		});
		$('#FeedBackPopup').show();
		
	}
	$scope.cancelFeedBackPopup = function () {
		$('#FeedBackPopup').hide();
	}
	$scope.addAttachement = function (body, ItemId) {
		
		$scope.UploadAttachments(body, ItemId, "FeedBackPicture" + $scope.param +".jpg");
	};
	$scope.UploadAttachments = function (body, itemId, fileName) {
		$(body).find("img").each(function () {
			var src = $(this).attr("src").split(",")[1];
			var byteArray = new Uint8Array(atob(src).split("").map(function (c) {
				return c.charCodeAt(0);
			}));
			var fileData = '';
			for (var i = 0; i < byteArray.byteLength; i++) {
				fileData += String.fromCharCode(byteArray[i]);
			}

			// use the request executor (cross domain library) to perform the upload
			var uploadExecutor = new SP.RequestExecutor(GlobalConstants.ADMIN_SITE_URL);
			var info = {
				url: GlobalConstants.ADMIN_SITE_URL + "/_api/web/lists/getbyId('" + $scope.listId + "')/items(" + itemId + ")/AttachmentFiles/add(FileName='" + fileName + "')",
				method: "POST",
				headers: {
					"Accept": "application/json; odata=verbose",
					"X-RequestDigest": document.getElementById("__REQUESTDIGEST").value,
				},
				contentType: "application/json;odata=verbose",
				binaryStringRequestBody: true,
				body: fileData,
				success: function (data) {
					$('#FeedBackPic').summernote('code', '');
					SharewebCommonFactoryService.hideProgressBar('feedbackprogressbar');
					$('#FeedBackPopup').hide();
					console.log("Success! Your attachment has been added to contact.");
				},
				error: function (err) {
					console.log(err);
				}
			};
			uploadExecutor.executeAsync(info);
		});

	};
	$scope.SaveFeedBack = function () {
		var date = new Date();
			$scope.param = date.getHours().toString() + date.getMinutes().toString() + date.getSeconds().toString();
			var FeedBackItem = {};
			FeedBackItem['Title'] = "FeedBackPicture" + $scope.param + ".jpg";
			FeedBackItem['FeedBackDescriptions'] = $scope.DescriptionFields;
			FeedBackItem['ImageDate'] = $scope.param;
			$scope.FeedBackDetails.push(FeedBackItem);
			var item = {
				"__metadata": { "type": $scope.metadata },
				Title: $scope.FeedBackTitle,
				FeedBack: angular.toJson($scope.FeedBackDetails),
				Priority: $scope.Priority,
				Status: $scope.Status,
				AssignedToId: { 'results': $scope.userIds },
				Company: $scope.Company,

			};

			SharewebListService.AddListItemByListId(GlobalConstants.ADMIN_SITE_URL, $scope.listId, item)
				.then(function (response) {
					var body = $('#FeedBackPic').summernote('code');
					if (body != undefined || body != "") {
						SharewebCommonFactoryService.showProgressBar('feedbackprogressbar');
						$scope.addAttachement(body, response.d.Id);
						$scope.loadTasks();

					}
				}, function (error) {
					SharewebCommonFactoryService.WriteLog("SPAngCorporateAlertsController->Save", "Error", JSON.stringify(error), "Add New");
					alert('Error: ' + error.result);
				});
	}
	$scope.addColumn = function (item) {
		$scope.DescriptionFields.push({ text: '' });
	}
	$scope.removeColumn = function (item, index) {
		$scope.DescriptionFields.splice(index, 1);
	}
}]);

