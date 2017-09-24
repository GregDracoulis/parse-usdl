export default function parse(str, skipErrors=false) {
  const props = {}

  // First split by \r (carriage return)
  let sections = str.trim().split('\r')

  let standardSection = null
  // We want the section that contains 'ANSI'
  for (let section of sections) {
    if (section.indexOf('ANSI') > -1) {
      standardSection = section
    }
  }

  if (!standardSection) {
    throw new Error('no standard section found');
  }

  const lines = standardSection.substring(standardSection.indexOf('ANSI')).trim().split('\n')

  // Remove the first ANSI line
  lines.shift();

  for (let line of lines) {
    let code = line.slice(0, 3)
    let value = line.slice(3).trim()
    let key = CODE_TO_KEY[code]
    if (!key) {
      if (!skipErrors) {
        throw new Error('unknown code: ' + code);
      }

      continue;
    }

    if (code === 'DBC') {
      if (value === '1') {
        value = 'M'
      } else if (value === '2') {
        value = 'F'
      }
    }

    if (key.indexOf('date') === 0) {
      let parts = [value.slice(0, 2), value.slice(2, 4), value.slice(4)]
      value = new Date(parts.join('/')).getTime()
    }

    props[key] = value
  }

  if (('givenName' in props) && !('firstName' in props)) {
    let splitGivenName = props['givenName'].split(',')

    props['firstName'] = splitGivenName.shift()

    // If there are remaining compnents, they all collectively make up the middle name
    if (splitGivenName && splitGivenName.length) {
      props['middleName'] = splitGivenName.join(',')
    }
  }

  if (('fullName' in props) && !('firstName' in props)) {
    let splitFullName = props['fullName'].split(' ')

    props['firstName'] = splitFullName.shift()
    props['lastName'] = splitFullName.pop()
    props['middleName'] = splitFullName.join(',')
  }

  return props
}

// Source: http://www.aamva.org/DL-ID-Card-Design-Standard/
const CODE_TO_KEY = {
  DCA: 'jurisdictionVehicleClass',
  DCB: 'jurisdictionRestrictionCodes',
  DCD: 'jurisdictionEndorsementCodes',
  DBA: 'dateOfExpiry',
  DCS: 'lastName',
  DCT: 'givenName',
  DAA: 'fullName',
  DAC: 'firstName',
  DAD: 'middleName',
  DBD: 'dateOfIssue',
  DBB: 'dateOfBirth',
  DBC: 'sex',
  DAY: 'eyeColor',
  DAU: 'height',
  DAG: 'addressStreet',
  DAI: 'addressCity',
  DAJ: 'addressState',
  DAK: 'addressPostalCode',
  DAQ: 'documentNumber',
  DCF: 'documentDiscriminator',
  DCG: 'issuer',
  DDE: 'lastNameTruncated',
  DDF: 'firstNameTruncated',
  DDG: 'middleNameTruncated',
  // optional
  DAZ: 'hairColor',
  DAH: 'addressStreet2',
  DCI: 'placeOfBirth',
  DCJ: 'auditInformation',
  DCK: 'inventoryControlNumber',
  DBN: 'otherLastName',
  DBG: 'otherFirstName',
  DBS: 'otherSuffixName',
  DCU: 'nameSuffix', // e.g. jr, sr
  DCE: 'weightRange',
  DCL: 'race',
  DCM: 'standardVehicleClassification',
  DCN: 'standardEndorsementCode',
  DCO: 'standardRestrictionCode',
  DCP: 'jurisdictionVehicleClassificationDescription',
  DCQ: 'jurisdictionEndorsementCodeDescription',
  DCR: 'jurisdictionRestrictionCodeDescription',
  DDA: 'complianceType',
  DDB: 'dateCardRevised',
  DDC: 'dateOfExpiryHazmatEndorsement',
  DDD: 'limitedDurationDocumentIndicator',
  DAW: 'weightLb',
  DAX: 'weightKg',
  DDH: 'dateAge18',
  DDI: 'dateAge19',
  DDJ: 'dateAge21',
  DDK: 'organDonor',
  DDL: 'veteran'
}
