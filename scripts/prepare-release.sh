#!/usr/bin/env bash
set -e
set -o pipefail

PREVIOUS_VERSION="$(cat deploy/olm-catalog/integreatly-operator/integreatly-operator.package.yaml | grep integreatly-operator | awk -F v '{print $2}')"

create_new_csv() {
  operator-sdk generate csv --csv-version "$VERSION" --default-channel --csv-channel=rhmi --update-crds --from-version "$PREVIOUS_VERSION"
}

set_csv() {
  if [[ -n "$VERSION" && -n "$TAG" ]]; then
    sed -i "s/containerImage:.*/containerImage: quay\.io\/integreatly\/integreatly-operator:v$VERSION/g" deploy/olm-catalog/integreatly-operator/${VERSION}/integreatly-operator.v${VERSION}.clusterserviceversion.yaml
    sed -i "s/image:.*/image: quay\.io\/integreatly\/integreatly-operator:v$VERSION-$TAG/g" deploy/olm-catalog/integreatly-operator/${VERSION}/integreatly-operator.v${VERSION}.clusterserviceversion.yaml
    sed -i "s/version: $VERSION.*/version: $VERSION-$TAG/g" deploy/olm-catalog/integreatly-operator/${VERSION}/integreatly-operator.v${VERSION}.clusterserviceversion.yaml
  fi

  if [[ -n "$VERSION" && -z "$TAG" ]]; then
    sed -i "s/containerImage:.*/containerImage: quay\.io\/integreatly\/integreatly-operator:v$VERSION/g" deploy/olm-catalog/integreatly-operator/${VERSION}/integreatly-operator.v${VERSION}.clusterserviceversion.yaml
    sed -i "s/image:.*/image: quay\.io\/integreatly\/integreatly-operator:v$VERSION/g" deploy/olm-catalog/integreatly-operator/${VERSION}/integreatly-operator.v${VERSION}.clusterserviceversion.yaml
  fi

  if [[ -z "$VERSION" && -n "$TAG" ]]; then
    sed -i "s/image:.*/image: quay\.io\/integreatly\/integreatly-operator:v$PREVIOUS_VERSION-$TAG/g" deploy/olm-catalog/integreatly-operator/${PREVIOUS_VERSION}/integreatly-operator.v${PREVIOUS_VERSION}.clusterserviceversion.yaml
    sed -i "s/version: ${PREVIOUS_VERSION}.*/version: ${PREVIOUS_VERSION}-${TAG}/g" deploy/olm-catalog/integreatly-operator/${PREVIOUS_VERSION}/integreatly-operator.v${PREVIOUS_VERSION}.clusterserviceversion.yaml
  fi
}

set_version_go() {
  sed -i "s/$PREVIOUS_VERSION/$VERSION/g" version/version.go
}

set_makefile() {
  sed -i "s/$PREVIOUS_VERSION/$VERSION/g" Makefile
}

print_usage() {
  echo "-v VERSION [1.0.0] will generate a new CSV and set that as new version"
  echo "-t TAG [rc1] will update operator.yml and CSV to use new image tag"
}

while getopts 'v:t:' options; do
  case "${options}" in
  v) VERSION="${OPTARG}" ;;
  t) TAG="${OPTARG}" ;;
  *) print_usage
     exit 1;;
  esac
done

if [[ -z "${TAG}" && -z "${VERSION}" ]]; then
  print_usage
fi

# New version and new tag
if [[ -n "${TAG}" && -n "${VERSION}" ]]; then
  create_new_csv
  set_csv
  set_version_go
  set_makefile
fi

# New version and no new tag
if [[ -n "${VERSION}" && -z "${TAG}" ]]; then
  create_new_csv
  set_csv
  set_makefile
  set_version_go
fi

# New tag and no new version
if [[ -n "${TAG}" && -z "${VERSION}" ]]; then
  set_csv
fi
