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
let nestedIndexName = 'nested'
let parentChildIndex = 'parent-child'

const newPerson = async () => {
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
    let response = await writeToES(separateDocumentIndexName, 'assessment', assessment.id, assessment)
  }
  let response = await writeToES(separateDocumentIndexName, 'person', person.id, person)

  // write as nested document
  let personWithNestedAssessments = Object.assign({
      assessment_count: assessments.length,
      assessments: assessments
    }, person)
  response = await writeToES(nestedIndexName, 'person', person.id, personWithNestedAssessments)

}

const writeToES = async (index, type, id, body) => {
  return await client.index({
    index: index,
    type: type,
    id: id,
    body: body
  })
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
