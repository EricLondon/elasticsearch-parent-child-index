const elasticsearch = require('elasticsearch')

const client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
})

const faker = require('faker')

//////////

let assessmentCounter = 0
let personCounter = 0
let personCount = 100

let separateDocumentIndexName = 'separate-document'
let sameDocumentIndexName = 'same-document'
let parentChildIndexName = 'parent-child'

const newPerson = async () => {
  let response = null
  personCounter += 1
  let person = {
    id: personCounter,
    name: faker.name.findName()
  }

  let assessmentCount = randomInt(10)
  let assessments = []
  for (let j = 0; j < assessmentCount; j++) {
    assessments.push(newAssessment())
  }

  let assessmentsWithPersonIds = assessments.map(a => {
    a.person_id = person.id
    return a
  })

  // write as separate documents
  for (let assessment of assessmentsWithPersonIds) {
    response = await writeToES(separateDocumentIndexName, 'assessment', assessment.id, assessment)
  }
  response = await writeToES(separateDocumentIndexName, 'person', person.id, person)

  // write as combined/same object
  let personWithNestedAssessments = Object.assign({
      assessment_count: assessments.length,
      assessments: assessments
    }, person)
  response = await writeToES(sameDocumentIndexName, 'person', person.id, personWithNestedAssessments)

  // write as parent-child
  response = await writeToES(parentChildIndexName, 'person', person.id, person)
  for (let assessment of assessmentsWithPersonIds) {
    response = await writeToES(parentChildIndexName, 'assessment', assessment.id, assessment, person.id)
  }

}

const writeToES = async (index, type, id, body, parent) => {
  let payload = {
    index: index,
    type: type,
    id: id,
    body: body
  }
  if (parent) {
    payload.parent = parent
  }
  return await client.index(payload)
}

const newAssessment = function() {
  assessmentCounter += 1
  let assessment = {
    id: assessmentCounter,
    name: faker.commerce.productName(),
    rank: randomInt(100)
  }
  return assessment
}

const randomInt = function(max) {
  return Math.floor(Math.random() * Math.floor(max))
}

const populate = async () => {
  for (let i = 0; i < personCount; i++) {
    let person = await newPerson()
  }
}

populate().then(function (result) {
  console.log('result', result)
}).catch(function (error) {
  console.log('error', error)
})
