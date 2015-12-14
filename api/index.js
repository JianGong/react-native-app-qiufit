/**
 * Created by guguyanhua on 12/11/15.
 */
var AV = require('avoscloud-sdk');
AV.initialize('OQYNgj8ffRah8qaSqaQjSgil-gzGzoHsz', 'CH8e9IdQw3FjIqJ14p2kJee2');
AV.Promise.setPromisesAPlusCompliant(true);

var CheckIn = AV.Object.extend("CheckIn");
var Profile = AV.Object.extend("Profile");

export default class API {

  /**
   * 完成训练
   */
  finishTurning(user, date, type, step) {
    //1. 记录打卡信息
    var checkIn = new CheckIn();
    checkIn.set('user', user);
    checkIn.set('date', date);
    checkIn.save();
    //2. 记录完成了哪个阶段
    var query = new AV.Query(Profile);
    query.equalTo('user', user);
    query.equalTo('type', type);
    query.equalTo('step', step);
    query.find({
      success: function (results) {
        if (results.length > 0) {
          var profile = results[0];
          profile.increment("count"); //完成数量+1
          profile.save();
        } else {
          var profile = new Profile();
          profile.set('user', user);
          profile.set('type', type);
          profile.set('step', step);
          profile.set('count', 1);
          profile.save();
        }
      },
      error: function (error) {
        console.log("Error: " + error.code + " " + error.message);
      }
    });

  }

  /**
   * 获取打卡信息
   * @param user
   */
  pullTurningDate(user, success, fail) {
    var query = new AV.Query(CheckIn);
    query.equalTo('user', user);
    query.find({
      success: function (results) {
        var result = {};
        for (var i = 0; i < results.length; i++) {
          var checkIn = results[i];
          var date = checkIn.get('date');
          var key = 'unknow';
          try {
            var keys = date.split('-');
            key = keys[0] + keys[1];
          } catch (e) {
          }
          if (result[key]) {
            result[key].push(date);
          } else {
            if (key !== 'unknow') {
              result[key] = [];
              result[key].push(date);
            }
          }
        }
        //merge
        success(result);
      },
      error: function (error) {
        console.log("Error: " + error.code + " " + error.message);
        fail(error);
      }
    });
  }

  /**
   * 获取类型
   * @param user
   */
  pullTurningStep(user, success, fail) {
    var query = new AV.Query(Profile);
    query.equalTo('user', user);
    query.find({
      success: function (results) {
        var result = {};
        for (var i = 0; i < results.length; i++) {
          var data = results[i];
          var type = data.get('type');
          var step = data.get('step');
          if (result[type]) {
            result[type].push(step);
          } else {
            result[type] = [];
            result[type].push(step);
          }
        }
        //merge
        success(result);
      },
      error: function (error) {
        console.log("Error: " + error.code + " " + error.message);
        fail(error);
      }
    });
  }


}
