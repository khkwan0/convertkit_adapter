const config = require('./config.js')
const fastify = require('fastify')()
const fetch = require('node-fetch')

var id = ''
var createdAt = ''
fastify.post('/check', (req, reply) => {
  var email = req.body.customer.email
  GetID(email)
  .then((user) => {
    id = user.id
    let someDate = new Date(user.createdAt)
    createdAt = (someDate.getMonth()+1) + '/' + someDate.getDate() + '/' + someDate.getFullYear()
    return GetTagsByID(id)
  })
  .then((tags) => {
    console.log(tags)
    let finalStr = ''
    let isMemberStr = '<div><span class="badge orange" style="background-color:#A5B2BD">NOT A MEMBER</span></div>'
    let tagsStr = '<ul style="list-style-type: none; margin-top:10px; margin-left:3px">'
    for (let i = 0; i < tags.tags.length; i++) {
      if (tags.tags[i].name.indexOf('Member -') === 0) {
        isMemberStr = '<div style="font-size: 11px"><span class="badge orange" style="background-color:#93A15F">MEMBER</span></div>'
      }
      tagsStr += '<li><i class="icon-tag" style="color: #bcbcbc"></i>' + tags.tags[i].name + '</li>'
//      tagsStr += '<li><i class="icon-tag" style="color: #93a1af"></i>' + tags.tags[i].name + '</li>'
    }
    tagsStr += '</ul>'
    linkURL = '<div><i class="icon-person"></i><a href="https://app.convertkit.com/subscribers/'+id+'">' + email + '</a></div><div style="font-size: 12px;margin-top:5px">Subscribed: ' + createdAt + '</div>'
    finalStr = linkURL + isMemberStr + tagsStr
    reply.code(200).send({"html": finalStr})
  })
  .catch((err) => {
    console.log(err)
    reply.code(200).send({err: 1, msg: err})
  })
})

GetID = (email) => {
  return new Promise((resolve, reject) => {
    fetch(config.convertkit.api.url + '/subscribers?api_secret=' + config.convertkit.api.secret + '&email_address=' + email, {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    })
    .then((result) => { return result.json() })
    .then((resultJson) => {
      if (typeof resultJson.subscribers !== 'undefined' &&
          resultJson.subscribers.length &&
          typeof resultJson.subscribers[0].email_address !== 'undefined' &&
          typeof resultJson.subscribers[0].id !== 'undefined' &&
          resultJson.subscribers[0].email_address === email
         )
      {
        resolve({id: resultJson.subscribers[0].id, createdAt: resultJson.subscribers[0].created_at})
      } else {
        reject('Cannot find user with email: ' + email)
      }
    })
    .catch((err) => {
      reject(err)
    })
  })
}

GetTagsByID = (id) => {
  return new Promise((resolve, reject) => {
    fetch(config.convertkit.api.url + '/subscribers/' + id + '/tags?api_secret=' + config.convertkit.api.secret, {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    })
    .then((result) => { return result.json() })
    .then((resultJson) => {
      resolve(resultJson)
    })
    .catch((err) => {
      reject(err)
    })
  })
}

fastify.listen(9095, '0.0.0.0', err => {
  console.log('adater listening on 9095')
  if (err) {
    console.log(err)
  }
})
